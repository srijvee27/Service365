import { NextRequest, NextResponse } from "next/server";
import { calculateDeliveryPricing, ServiceType, PaymentMethod } from "@/lib/pricing-engine";
import { getZoneByDistrict } from "@/lib/bangladesh-data";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export async function GET() {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json({
        success: true,
        data: [
          {
            fromZone: "INSIDE_DHAKA",
            toZone: "INSIDE_DHAKA",
            serviceType: "REGULAR",
            baseCharge: 60,
            additionalWeightCharge: 15,
            codPercentage: 1,
            active: true,
          },
          {
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
      where: { active: true },
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fromDistrict,
      toDistrict,
      weightKg = 1,
      paymentMethod = "COD",
      codAmount = 0,
      declaredValue = 0,
    } = body;

    const rawService = (body.serviceType || body.deliverySpeed || "REGULAR").toString().toUpperCase();
    const serviceType = rawService.includes("EXPRESS")
      ? "EXPRESS"
      : rawService.includes("SAME")
      ? "SAME_DAY"
      : "REGULAR";

    const fromZone = body.fromZone || (fromDistrict ? getZoneByDistrict(fromDistrict) : "INSIDE_DHAKA");
    const toZone = body.toZone || (toDistrict ? getZoneByDistrict(toDistrict) : "OUTSIDE_DHAKA");

    let customRule;
    if (isDatabaseConfigured) {
      let dbRule = await prisma.pricingRule.findFirst({
        where: {
          fromZone,
          toZone,
          serviceType: serviceType as ServiceType,
          active: true,
        },
      });

      if (!dbRule) {
        dbRule = await prisma.pricingRule.findFirst({
          where: {
            fromZone,
            toZone,
            serviceType: "REGULAR",
            active: true,
          },
        });
      }

      if (dbRule) {
        customRule = {
          baseCharge: Number(dbRule.baseCharge),
          extraPerKg: Number(dbRule.additionalWeightCharge),
          codPercentage: Number(dbRule.codPercentage),
          taxPercentage: Number(dbRule.taxPercentage),
        };
      }
    }

    const calculation = calculateDeliveryPricing({
      fromZone,
      toZone,
      weightKg: Number(weightKg),
      serviceType: serviceType as ServiceType,
      paymentMethod: paymentMethod as PaymentMethod,
      codAmount: Number(codAmount),
      declaredValue: Number(declaredValue) || 0,
      customRule,
    });

    const zoneLabels: Record<string, string> = {
      INSIDE_DHAKA: "Inside Dhaka",
      DHAKA_SUBURB: "Dhaka Suburbs",
      OUTSIDE_DHAKA: "Outside Dhaka",
    };
    const serviceLabels: Record<string, string> = {
      REGULAR: "Regular Transit (24-72h)",
      EXPRESS: "Express Next-Day (Priority Transit)",
      SAME_DAY: "Same Day Dhaka (Within 6-8h)",
    };

    return NextResponse.json({
      success: true,
      data: {
        ...calculation,
        fromZone,
        toZone,
        appliedRoute: `${zoneLabels[fromZone] || fromZone} → ${zoneLabels[toZone] || toZone}`,
        appliedService: serviceLabels[serviceType] || serviceType,
        deliveryCharge: calculation.baseCharge + calculation.weightCharge,
        codPercentage: calculation.breakdown.codPercentage,
        recommendedCodAmount: calculation.recommendedCodAmount,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Pricing calculation error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
