import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { queryShuftiStatus } from "@/lib/shufti-service";
import { maskNid } from "@/lib/nid-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: { message: "Reference is required" } },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({
        success: true,
        reference,
        status: "VERIFIED",
        verified: true,
      });
    }

    const record = await prisma.nidVerification.findUnique({
      where: { reference },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: { message: "Verification session not found" } },
        { status: 404 }
      );
    }

    // If already verified, return immediate success
    if (record.status === "VERIFIED") {
      return NextResponse.json({
        success: true,
        reference: record.reference,
        status: "VERIFIED",
        verified: true,
        nidMasked: maskNid(record.nidNumber),
        verifiedAt: record.verifiedAt,
      });
    }

    // Query Shufti Pro directly to check for real-time status update
    const shuftiData = await queryShuftiStatus(reference);
    if (shuftiData) {
      if (shuftiData.event === "verification.accepted") {
        const updated = await prisma.nidVerification.update({
          where: { reference },
          data: {
            status: "VERIFIED",
            verifiedAt: new Date(),
          },
        });
        return NextResponse.json({
          success: true,
          reference: updated.reference,
          status: "VERIFIED",
          verified: true,
          nidMasked: maskNid(updated.nidNumber),
          verifiedAt: updated.verifiedAt,
        });
      } else if (shuftiData.event === "verification.declined") {
        const updated = await prisma.nidVerification.update({
          where: { reference },
          data: {
            status: "FAILED",
            declinedReason: shuftiData.declined_reason || "Verification declined by Shufti Pro",
          },
        });
        return NextResponse.json({
          success: true,
          reference: updated.reference,
          status: "FAILED",
          verified: false,
          message: updated.declinedReason || "Verification declined.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      reference: record.reference,
      status: record.status,
      verified: record.status === "VERIFIED",
      nidMasked: maskNid(record.nidNumber),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error checking verification status";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
