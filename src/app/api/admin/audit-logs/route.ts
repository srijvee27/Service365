import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireRole([Role.ADMIN, Role.SUPER_ADMIN]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "aud_1",
            action: "MERCHANT_STATUS_UPDATE",
            entity: "Merchant",
            entityId: "m_1",
            details: { newStatus: "APPROVED", updatedBy: "admin@service365.demo" },
            user: { email: "admin@service365.demo", name: "System Admin" },
            createdAt: new Date().toISOString(),
          },
          {
            id: "aud_2",
            action: "PRICING_RULE_UPDATED",
            entity: "PricingRule",
            entityId: "pr_1",
            details: { baseCharge: 60, updatedBy: "admin@service365.demo" },
            user: { email: "admin@service365.demo", name: "System Admin" },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      });
    }

    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching audit logs";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
