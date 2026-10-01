import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, MerchantStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: `Merchant status updated to ${status} (mock)` });
    }

    const updated = await prisma.merchant.update({
      where: { id },
      data: {
        status: status as MerchantStatus,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "MERCHANT_STATUS_UPDATE",
        entity: "Merchant",
        entityId: id,
        after: JSON.stringify({ newStatus: status, updatedBy: session.email }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating merchant status";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
