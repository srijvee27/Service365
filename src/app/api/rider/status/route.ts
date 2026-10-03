import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { Role, RiderStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireAuth([Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses = Object.values(RiderStatus);
    if (!status || !validStatuses.includes(status as RiderStatus)) {
      return NextResponse.json(
        { success: false, error: { message: `Invalid status. Expected one of: ${validStatuses.join(", ")}` } },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Status updated (mock mode)" });
    }

    let riderId = session.riderId;
    if (!riderId) {
      const r = await prisma.rider.findUnique({ where: { userId: session.id } });
      riderId = r?.id;
    }

    if (!riderId) {
      return NextResponse.json({ success: false, error: { message: "Rider profile not found" } }, { status: 404 });
    }

    const updated = await prisma.rider.update({
      where: { id: riderId },
      data: { status: status as RiderStatus },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating rider status";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
