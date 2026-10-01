import { NextRequest, NextResponse } from "next/server";
import { calculateDeliveryPricing, ServiceType, PaymentMethod } from "@/lib/pricing-engine";
import { getZoneByDistrict } from "@/lib/bangladesh-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fromDistrict,
      toDistrict,
      weightKg = 1,
      serviceType = "REGULAR",
      paymentMethod = "COD",
      codAmount = 0,
    } = body;

    const fromZone = body.fromZone || (body.fromDistrict ? getZoneByDistrict(body.fromDistrict) : "INSIDE_DHAKA");
    const toZone = body.toZone || (body.toDistrict ? getZoneByDistrict(body.toDistrict) : "OUTSIDE_DHAKA");


    const calculation = calculateDeliveryPricing({
      fromZone,
      toZone,
      weightKg: Number(weightKg),
      serviceType: serviceType as ServiceType,
      paymentMethod: paymentMethod as PaymentMethod,
      codAmount: Number(codAmount),
    });

    return NextResponse.json({
      success: true,
      data: calculation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Pricing calculation error";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
