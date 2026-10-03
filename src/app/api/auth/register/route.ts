import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME, SessionPayload } from "@/lib/auth";
import { normalizeBangladeshPhone } from "@/lib/utils";
import { isValidBangladeshNid } from "@/lib/nid-service";
import { Role, MerchantStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role = "CUSTOMER", businessName, vehicleType, nidNumber } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELDS", message: "Name, email, phone and password are required" } },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: "WEAK_PASSWORD", message: "Password must be at least 6 characters" } },
        { status: 400 }
      );
    }

    // Phone Normalization
    const phoneResult = normalizeBangladeshPhone(phone);
    if (!phoneResult.isValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PHONE", message: phoneResult.error } },
        { status: 400 }
      );
    }
    const normalizedPhone = phoneResult.normalized;
    const normalizedEmail = email.toLowerCase().trim();

    // Rider-specific NID validation & Shufti verification enforcement
    if (role === "RIDER") {
      if (!nidNumber || !nidNumber.trim()) {
        return NextResponse.json(
          { success: false, error: { code: "MISSING_NID", message: "NID number is required for rider registration." } },
          { status: 400 }
        );
      }
      if (!isValidBangladeshNid(nidNumber)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_NID",
              message: "Invalid Bangladesh NID. Must be 10 digits (Smart Card), 13 digits, or 17 digits.",
            },
          },
          { status: 400 }
        );
      }

      // Backend independently verifies NID status from database
      if (isDatabaseConfigured) {
        const cleanNid = nidNumber.trim();
        const verification = await prisma.nidVerification.findFirst({
          where: {
            nidNumber: cleanNid,
            status: "VERIFIED",
            ...(body.nidReference ? { reference: body.nidReference } : {}),
          },
          orderBy: { verifiedAt: "desc" },
        });

        if (!verification) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "NID_NOT_VERIFIED",
                message: "NID verification is required before completing registration.",
              },
            },
            { status: 400 }
          );
        }
      }
    }

    // Check existing
    if (isDatabaseConfigured) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_EXISTS",
              message: existingUser.email === normalizedEmail
                ? "An account with this email already exists"
                : "An account with this phone number already exists",
            },
          },
          { status: 409 }
        );
      }

      if (role === "RIDER" && nidNumber) {
        const existingNid = await prisma.rider.findFirst({
          where: {
            nidNumber: nidNumber.trim(),
            deletedAt: null,
          },
        });
        if (existingNid) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "NID_EXISTS",
                message: "A rider account with this NID already exists.",
              },
            },
            { status: 409 }
          );
        }
      }
    }

    const passwordHash = await hashPassword(password);
    let assignedRole: Role = Role.CUSTOMER;
    if (role === "MERCHANT") {
      assignedRole = Role.MERCHANT;
    } else if (role === "RIDER") {
      assignedRole = Role.RIDER;
    }

    let createdUser;
    let merchantId: string | undefined;
    let customerId: string | undefined;
    let riderId: string | undefined;

    if (isDatabaseConfigured) {
      createdUser = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          phone: normalizedPhone,
          passwordHash,
          role: assignedRole,
          emailVerified: false,
          phoneVerified: false,
        },
      });

      if (assignedRole === Role.MERCHANT) {
        const merchant = await prisma.merchant.create({
          data: {
            userId: createdUser.id,
            businessName: businessName || `${name}'s Store`,
            status: MerchantStatus.PENDING,
          },
        });
        merchantId = merchant.id;

        // Initialize merchant wallet
        await prisma.wallet.create({
          data: {
            merchantId: merchant.id,
            availableBalance: 0.0,
            pendingBalance: 0.0,
            totalWithdrawn: 0.0,
          },
        });
      } else if (assignedRole === Role.RIDER) {
        const riderCount = await prisma.rider.count();
        const customRiderId = `RDR-${String(riderCount + 101).padStart(3, "0")}`;

        const rider = await prisma.rider.create({
          data: {
            userId: createdUser.id,
            riderId: customRiderId,
            vehicleType: vehicleType || "BIKE",
            nidNumber: nidNumber ? nidNumber.trim() : null,
            approvalStatus: "PENDING",
            nidVerificationStatus: "VERIFIED",
            nidVerifiedAt: new Date(),
            nidVerifiedBy: "SHUFTI_PRO",
            shuftiReference: body.nidReference || null,
            status: "AVAILABLE",
            hub: "Inside Dhaka Hub",
          },
        });
        riderId = rider.id;
      } else {
        const customer = await prisma.customer.create({
          data: {
            userId: createdUser.id,
          },
        });
        customerId = customer.id;
      }
    } else {
      createdUser = {
        id: `usr_mock_${Date.now()}`,
        name,
        email: normalizedEmail,
        phone: normalizedPhone,
        role: assignedRole,
      };
      if (assignedRole === Role.MERCHANT) merchantId = `mer_mock_${Date.now()}`;
      else if (assignedRole === Role.RIDER) riderId = `rdr_mock_${Date.now()}`;
      else customerId = `cus_mock_${Date.now()}`;
    }

    const payload: SessionPayload = {
      id: createdUser.id,
      email: normalizedEmail,
      name,
      phone: normalizedPhone,
      role: assignedRole,
      merchantId,
      customerId,
      riderId,
    };

    const token = await createSessionToken(payload);
    const res = NextResponse.json({
      success: true,
      user: payload,
      message:
        assignedRole === Role.RIDER
          ? "Rider account registered! Your application is pending admin approval."
          : "Account registered successfully",
    });

    if (assignedRole !== Role.RIDER) {
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json(
      { success: false, error: { code: "REGISTRATION_ERROR", message } },
      { status: 500 }
    );
  }
}
