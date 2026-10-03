import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { isValidBangladeshNid, maskNid } from "@/lib/nid-service";
import { startShuftiVerification } from "@/lib/shufti-service";
import { normalizeBangladeshPhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, nidNumber } = body;

    if (!name || !email || !phone || !nidNumber) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "Name, email, phone, and NID number are required to start verification.",
          },
        },
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

    const phoneResult = normalizeBangladeshPhone(phone);
    if (!phoneResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_PHONE", message: phoneResult.error },
        },
        { status: 400 }
      );
    }

    const cleanNid = nidNumber.trim();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if this NID is already registered to an active/non-deleted rider
    if (isDatabaseConfigured) {
      const existingRider = await prisma.rider.findFirst({
        where: {
          nidNumber: cleanNid,
          deletedAt: null,
        },
      });
      if (existingRider) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NID_EXISTS",
              message: "A rider account with this NID already exists in the system.",
            },
          },
          { status: 409 }
        );
      }
    }

    // Call Shufti Pro API from backend
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/rider/register?nid_verified=1`;
    const shuftiRes = await startShuftiVerification({
      name: name.trim(),
      email: normalizedEmail,
      phone: phoneResult.normalized,
      nidNumber: cleanNid,
      redirectUrl,
    });

    if (!shuftiRes.success || !shuftiRes.verificationUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SHUFTI_ERROR",
            message: shuftiRes.error || "Unable to start Shufti Pro verification session.",
          },
        },
        { status: 502 }
      );
    }

    // Record session in database
    if (isDatabaseConfigured) {
      await prisma.nidVerification.create({
        data: {
          reference: shuftiRes.reference,
          nidNumber: cleanNid,
          fullName: name.trim(),
          email: normalizedEmail,
          phone: phoneResult.normalized,
          status: "PENDING",
          verificationUrl: shuftiRes.verificationUrl,
          shuftiReference: shuftiRes.reference,
        },
      });
    }

    return NextResponse.json({
      success: true,
      reference: shuftiRes.reference,
      verificationUrl: shuftiRes.verificationUrl,
      nidMasked: maskNid(cleanNid),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error starting verification";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
