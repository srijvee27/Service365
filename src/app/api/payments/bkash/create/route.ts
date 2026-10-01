import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payment";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, amount, customerPhone } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, error: { message: "Order ID and Amount are required" } },
        { status: 400 }
      );
    }

    let orderNumber = orderId;
    if (isDatabaseConfigured) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order) orderNumber = order.orderNumber;
    }

    const provider = getPaymentProvider();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/payments/bkash/callback`;

    const paymentResponse = await provider.createPayment({
      orderId,
      orderNumber,
      amount: Number(amount),
      customerPhone: customerPhone || session.phone,
      callbackUrl,
    });

    if (!paymentResponse.success) {
      return NextResponse.json(
        { success: false, error: { message: paymentResponse.errorMessage || "Failed to initialize payment" } },
        { status: 502 }
      );
    }

    // Record initiated payment in database
    if (isDatabaseConfigured) {
      await prisma.payment.create({
        data: {
          orderId,
          paymentMethod: "BKASH",
          amount: Number(amount),
          status: "INITIATED",
          gatewayPaymentId: paymentResponse.paymentId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.paymentId,
      redirectUrl: paymentResponse.redirectUrl,
      isMock: paymentResponse.isMock,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment initialization error";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
