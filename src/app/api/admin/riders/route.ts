import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, RiderStatus, ZoneType } from "@prisma/client";
import { maskNid } from "@/lib/nid-service";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: error || "Unauthorized" } },
        { status: 401 }
      );
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const { searchParams } = new URL(req.url);
    const showDeleted = searchParams.get("deleted") === "true";

    const whereClause = showDeleted
      ? { deletedAt: { not: null } }
      : { deletedAt: null };

    const [riders, activeCount, deletedCount] = await Promise.all([
      prisma.rider.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
          assignments: {
            where: { status: "ASSIGNED" },
          },
          assignedOrders: {
            where: {
              status: {
                in: ["ASSIGNED", "ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY"],
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rider.count({ where: { deletedAt: null } }),
      prisma.rider.count({ where: { deletedAt: { not: null } } }),
    ]);

    const formatted = riders.map((r) => {
      const activeTasksCount = Math.max(r.assignments.length, r.assignedOrders.length);
      return {
        id: r.id,
        userId: r.userId,
        riderId: r.riderId || `RDR-${r.id.slice(-3).toUpperCase()}`,
        name: r.user.name,
        phone: r.user.phone,
        email: r.user.email,
        zone: r.currentZone,
        hub: r.hub || `${r.currentZone.replace(/_/g, " ")} Hub`,
        vehicleType: r.vehicleType,
        nidMasked: maskNid(r.nidNumber),
        hasNid: Boolean(r.nidNumber),
        nidVerificationStatus: r.nidVerificationStatus || "UNVERIFIED",
        nidVerifiedAt: r.nidVerifiedAt,
        nidVerifiedBy: r.nidVerifiedBy,
        approvalStatus: r.approvalStatus || "PENDING",
        status: r.status,
        isActive: r.user.isActive && r.approvalStatus === "APPROVED" && !r.deletedAt,
        cashInHand: Number(r.cashInHand || 0),
        activeAssignments: activeTasksCount,
        deletedAt: r.deletedAt,
        deletedBy: r.deletedBy,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      counts: {
        active: activeCount,
        deleted: deletedCount,
        total: activeCount + deletedCount,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching riders";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: error || "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      riderId,
      isActive,
      approvalStatus,
      nidVerificationStatus,
      hub,
      currentZone,
      vehicleType,
      status,
    } = body;

    if (!riderId) {
      return NextResponse.json(
        { success: false, error: { message: "Rider ID is required" } },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Rider status updated (mock)" });
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status as RiderStatus;
    } else if (isActive !== undefined) {
      updateData.status = isActive ? RiderStatus.AVAILABLE : RiderStatus.OFFLINE;
    }

    if (approvalStatus !== undefined) {
      updateData.approvalStatus = approvalStatus;
      if (approvalStatus === "APPROVED") {
        updateData.status = RiderStatus.AVAILABLE;
      }
    }

    if (nidVerificationStatus !== undefined) {
      updateData.nidVerificationStatus = nidVerificationStatus;
      if (nidVerificationStatus === "VERIFIED") {
        updateData.nidVerifiedAt = new Date();
        updateData.nidVerifiedBy = session.email;
      }
    }

    if (hub !== undefined) updateData.hub = hub;
    if (currentZone !== undefined) updateData.currentZone = currentZone as ZoneType;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;

    const updated = await prisma.rider.update({
      where: { id: riderId },
      data: updateData,
      include: { user: true },
    });

    // Sync User.isActive status
    if (isActive !== undefined || approvalStatus !== undefined) {
      const shouldUserBeActive =
        isActive !== undefined
          ? isActive
          : approvalStatus === "APPROVED";
      await prisma.user.update({
        where: { id: updated.userId },
        data: { isActive: shouldUserBeActive },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating rider";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: error || "Unauthorized" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let riderId = searchParams.get("id") || searchParams.get("riderId");

    if (!riderId) {
      const body = await req.json().catch(() => ({}));
      riderId = body.riderId || body.id;
    }

    if (!riderId) {
      return NextResponse.json(
        { success: false, error: { message: "Rider ID is required for deletion" } },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Rider soft-deleted (mock mode)" });
    }

    // Soft delete rider: preserve orders, disable login, record deletion timestamp & admin email
    const updated = await prisma.rider.update({
      where: { id: riderId },
      data: {
        deletedAt: new Date(),
        deletedBy: session.email,
        status: "OFFLINE",
        approvalStatus: "SUSPENDED",
        user: {
          update: {
            isActive: false,
          },
        },
      },
      include: { user: true },
    });

    // Record in Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          role: session.role,
          action: "RIDER_SOFT_DELETE",
          entity: "Rider",
          entityId: riderId,
          after: JSON.stringify({
            deletedAt: new Date(),
            deletedBy: session.email,
            riderId: updated.riderId,
            name: updated.user.name,
            phone: updated.user.phone,
          }),
        },
      });
    } catch {
      // Audit log non-critical failure
    }

    return NextResponse.json({
      success: true,
      message: `Rider ${updated.user.name} (${updated.riderId || updated.id}) moved to Deleted Riders history.`,
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting rider";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

