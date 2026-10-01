import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

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
            id: "m_1",
            businessName: "Star Tech BD",
            contactPerson: "Mahmudur Rahman",
            phone: "+8801711223344",
            email: "merchant@service365.demo",
            status: "APPROVED",
            district: "Dhaka",
            walletBalance: 12450,
            totalOrders: 28,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true, phone: true } },
        wallet: true,
        stores: true,
        _count: { select: { orders: true } },
      },
    });

    const formatted = merchants.map((m) => ({
      id: m.id,
      businessName: m.businessName,
      contactPerson: m.contactPerson || m.user.name,
      phone: m.user.phone,
      email: m.user.email,
      status: m.status,
      district: m.stores[0]?.district || "Dhaka",
      walletBalance: Number(m.wallet?.availableBalance || 0),
      totalOrders: m._count.orders,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching merchants";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
