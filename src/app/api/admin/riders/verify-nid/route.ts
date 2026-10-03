import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { verifyNidWithOfficialGateway, maskNid } from "@/lib/nid-service";

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: error || "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { riderId } = body;

    if (!riderId) {
      return NextResponse.json(
        { success: false, error: { message: "Rider ID is required" } },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json(
        { success: false, error: { message: "Database not configured" } },
        { status: 500 }
      );
    }

    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
      include: { user: true },
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, error: { message: "Rider not found" } },
        { status: 404 }
      );
    }

    if (!rider.nidNumber) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Rider has not provided an NID number." },
        },
        { status: 400 }
      );
    }

    // Attempt official NID verification through the official gateway
    // Does NOT scrape or invent fake responses
    const verification = await verifyNidWithOfficialGateway(
      rider.nidNumber,
      rider.user.name
    );

    return NextResponse.json({
      success: true,
      data: {
        configured: verification.configured,
        verified: verification.success,
        message: verification.message,
        nidMasked: maskNid(rider.nidNumber),
        verifiedName: verification.verifiedName || null,
        dateOfBirth: verification.dateOfBirth || null,
        currentVerificationStatus: rider.nidVerificationStatus || "UNVERIFIED",
        nidVerifiedAt: rider.nidVerifiedAt,
        nidVerifiedBy: rider.nidVerifiedBy,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error verifying NID";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
