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
            id: "pr_1",
            fromZone: "INSIDE_DHAKA",
            toZone: "INSIDE_DHAKA",
            serviceType: "REGULAR",
            baseCharge: 60,
            additionalWeightCharge: 15,
            codPercentage: 0,
            active: true,
          },
          {
            id: "pr_2",
            fromZone: "INSIDE_DHAKA",
            toZone: "OUTSIDE_DHAKA",
            serviceType: "REGULAR",
            baseCharge: 130,
            additionalWeightCharge: 25,
            codPercentage: 1,
            active: true,
          },
        ],
      });
    }

    const rules = await prisma.pricingRule.findMany({
      orderBy: [{ fromZone: "asc" }, { toZone: "asc" }],
    });

    const formatted = rules.map((r) => ({
      id: r.id,
      fromZone: r.fromZone,
      toZone: r.toZone,
      serviceType: r.serviceType,
      baseCharge: Number(r.baseCharge),
      additionalWeightCharge: Number(r.additionalWeightCharge),
      codPercentage: Number(r.codPercentage),
      taxPercentage: Number(r.taxPercentage),
      active: r.active,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching pricing rules";
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
    const { id, baseCharge, additionalWeightCharge, codPercentage, active } = body;

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Pricing rule updated (mock)" });
    }

    const updated = await prisma.pricingRule.update({
      where: { id },
      data: {
        baseCharge: baseCharge !== undefined ? Number(baseCharge) : undefined,
        additionalWeightCharge: additionalWeightCharge !== undefined ? Number(additionalWeightCharge) : undefined,
        codPercentage: codPercentage !== undefined ? Number(codPercentage) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    // Record audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "PRICING_RULE_UPDATED",
        entity: "PricingRule",
        entityId: id,
        after: JSON.stringify({ baseCharge, additionalWeightCharge, codPercentage, updatedBy: session.email }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating pricing rule";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
