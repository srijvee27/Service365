import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, RiderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "r_1",
            name: "Kamrul Hasan",
            phone: "+8801911223344",
            email: "rider@service365.demo",
            zone: "INSIDE_DHAKA",
            hub: "Dhanmondi Hub",
            vehicleType: "MOTORCYCLE",
            isActive: true,
            cashInHand: 4500,
            activeAssignments: 2,
          },
        ],
      });
    }

    const riders = await prisma.rider.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        assignments: {
          where: { status: "ASSIGNED" },
        },
      },
    });

    const formatted = riders.map((r) => ({
      id: r.id,
      name: r.user.name,
      phone: r.user.phone,
      email: r.user.email,
      zone: r.currentZone,
      hub: `${r.currentZone.replace(/_/g, " ")} Hub`,
      vehicleType: r.vehicleType,
      isActive: r.status === RiderStatus.AVAILABLE || r.status === RiderStatus.BUSY,
      cashInHand: Number(r.cashInHand || 0),
      activeAssignments: r.assignments.length,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching riders";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const { riderId, isActive } = body;

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Rider status updated (mock)" });
    }

    const updated = await prisma.rider.update({
      where: { id: riderId },
      data: {
        status: isActive ? RiderStatus.AVAILABLE : RiderStatus.OFFLINE,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating rider";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
