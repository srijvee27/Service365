import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME, SessionPayload } from "@/lib/auth";
import { normalizeBangladeshPhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Email or phone number and password are required" } },
        { status: 400 }
      );
    }

    // Mock fallback if PostgreSQL DATABASE_URL is not yet connected during local trial
    if (!isDatabaseConfigured) {
      // Provide mock login for development testing
      let mockRole = role || "MERCHANT";
      if (identifier.includes("admin")) mockRole = "SUPER_ADMIN";
      if (identifier.includes("rider")) mockRole = "RIDER";
      if (identifier.includes("customer")) mockRole = "CUSTOMER";

      const mockPayload: SessionPayload = {
        id: "usr_mock_123",
        email: identifier.includes("@") ? identifier : `${identifier}@demo.bd`,
        name: identifier.split("@")[0].toUpperCase(),
        phone: "+8801700000001",
        role: mockRole,
        merchantId: mockRole === "MERCHANT" ? "mer_mock_123" : undefined,
        riderId: mockRole === "RIDER" ? "rdr_mock_123" : undefined,
      };

      const token = await createSessionToken(mockPayload);
      const res = NextResponse.json({
        success: true,
        user: mockPayload,
        message: "Logged in via Development Sandbox Mode (DATABASE_URL unconfigured)",
      });

      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return res;
    }

    // Normalized phone or email lookup
    const isEmail = identifier.includes("@");
    let user;

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: identifier.toLowerCase().trim() },
        include: { merchant: true, rider: true, customer: true },
      });
    } else {
      const normalizedPhone = normalizeBangladeshPhone(identifier).normalized;
      user = await prisma.user.findFirst({
        where: {
          OR: [{ phone: identifier }, { phone: normalizedPhone }],
        },
        include: { merchant: true, rider: true, customer: true },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email/phone or password" } },
        { status: 401 }
      );
    }

    // Verify Password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email/phone or password" } },
        { status: 401 }
      );
    }

    // Check if role matches if specific role was requested
    if (role && user.role !== role && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "ROLE_MISMATCH", message: `Account is not registered as ${role}` } },
        { status: 403 }
      );
    }

    const payload: SessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      merchantId: user.merchant?.id,
      riderId: user.rider?.id,
      customerId: user.customer?.id,
    };

    const token = await createSessionToken(payload);

    const res = NextResponse.json({
      success: true,
      user: payload,
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal authentication error";
    return NextResponse.json(
      { success: false, error: { code: "AUTH_ERROR", message } },
      { status: 500 }
    );
  }
}
