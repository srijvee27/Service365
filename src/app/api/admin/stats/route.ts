import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, OrderStatus, CodStatus, RiderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({
        success: true,
        data: {
          totalOrders: 42,
          deliveredOrders: 28,
          inTransitOrders: 9,
          pendingPickupOrders: 5,
          totalRevenue: 6840,
          totalCodCollected: 148500,
          pendingCodSettlement: 34200,
          activeMerchants: 14,
          activeRiders: 8,
          recentOrders: [],
        },
      });
    }

    const [
      totalOrders,
      deliveredOrders,
      inTransitOrders,
      pendingOrders,
      activeMerchants,
      activeRiders,
      revenueAgg,
      codCollectedAgg,
      codPendingAgg,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({
        where: {
          status: { in: [OrderStatus.PICKED_UP, OrderStatus.AT_SORTING_CENTER, OrderStatus.IN_TRANSIT, OrderStatus.OUT_FOR_DELIVERY] },
        },
      }),
      prisma.order.count({
        where: {
          status: { in: [OrderStatus.ORDER_CREATED, OrderStatus.ORDER_CONFIRMED, OrderStatus.PICKUP_REQUESTED] },
        },
      }),
      prisma.merchant.count(),
      prisma.rider.count({ where: { status: { in: [RiderStatus.AVAILABLE, RiderStatus.BUSY] } } }),
      prisma.order.aggregate({
        _sum: { totalCharge: true },
      }),
      prisma.codTransaction.aggregate({
        where: { status: CodStatus.COLLECTED },
        _sum: { amount: true },
      }),
      prisma.codTransaction.aggregate({
        where: { status: CodStatus.PENDING },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { merchant: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        deliveredOrders,
        inTransitOrders,
        pendingPickupOrders: pendingOrders,
        totalRevenue: Number(revenueAgg._sum.totalCharge || 0),
        totalCodCollected: Number(codCollectedAgg._sum.amount || 0),
        pendingCodSettlement: Number(codPendingAgg._sum.amount || 0),
        activeMerchants,
        activeRiders,
        recentOrders,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching stats";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
