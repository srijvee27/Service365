import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, ZoneType, ServiceType } from "@prisma/client";

function parseZone(val: unknown): ZoneType | null {
  if (typeof val !== "string") return null;
  const norm = val.trim().toUpperCase().replace(/\s+/g, "_");
  if (norm === "INSIDE_DHAKA" || norm === "INSIDE") return ZoneType.INSIDE_DHAKA;
  if (norm === "DHAKA_SUBURB" || norm === "DHAKA_SUBURBS" || norm === "SUBURB") return ZoneType.DHAKA_SUBURB;
  if (norm === "OUTSIDE_DHAKA" || norm === "OUTSIDE") return ZoneType.OUTSIDE_DHAKA;
  return null;
}

function parseServiceType(val: unknown): ServiceType | null {
  if (typeof val !== "string") return null;
  const norm = val.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (norm === "REGULAR" || norm.includes("REGULAR") || norm.includes("TRANSIT")) return ServiceType.REGULAR;
  if (norm === "EXPRESS" || norm.includes("EXPRESS")) return ServiceType.EXPRESS;
  if (norm === "SAME_DAY" || norm.includes("SAME")) return ServiceType.SAME_DAY;
  return null;
}

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
      orderBy: [{ serviceType: "asc" }, { fromZone: "asc" }, { toZone: "asc" }],
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

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireRole(["ADMIN", "SUPER_ADMIN"]);
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const {
      fromZone,
      toZone,
      serviceType = "REGULAR",
      baseCharge,
      additionalWeightCharge = 0,
      codPercentage = 1,
      active = true,
    } = body;

    const validFromZone = parseZone(fromZone);
    const validToZone = parseZone(toZone);
    const validServiceType = parseServiceType(serviceType) || ServiceType.REGULAR;

    if (!validFromZone || !validToZone) {
      return NextResponse.json(
        { success: false, error: { message: "Valid origin zone and destination zone are required." } },
        { status: 400 }
      );
    }

    if (baseCharge === undefined || isNaN(Number(baseCharge)) || Number(baseCharge) < 0) {
      return NextResponse.json(
        { success: false, error: { message: "A valid base charge is required." } },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Pricing rule created (mock)" });
    }

    const rule = await prisma.pricingRule.upsert({
      where: {
        fromZone_toZone_serviceType: {
          fromZone: validFromZone,
          toZone: validToZone,
          serviceType: validServiceType,
        },
      },
      update: {
        baseCharge: Number(baseCharge),
        additionalWeightCharge: Number(additionalWeightCharge),
        codPercentage: Number(codPercentage),
        active: Boolean(active),
      },
      create: {
        fromZone: validFromZone,
        toZone: validToZone,
        serviceType: validServiceType,
        baseCharge: Number(baseCharge),
        additionalWeightCharge: Number(additionalWeightCharge),
        codPercentage: Number(codPercentage),
        active: Boolean(active),
      },
    });

    // Record audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "PRICING_RULE_CREATED",
        entity: "PricingRule",
        entityId: rule.id,
        after: JSON.stringify({
          fromZone,
          toZone,
          serviceType,
          baseCharge,
          additionalWeightCharge,
          codPercentage,
          updatedBy: session.email,
        }),
      },
    });

    return NextResponse.json({ success: true, data: rule });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating pricing rule";
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
