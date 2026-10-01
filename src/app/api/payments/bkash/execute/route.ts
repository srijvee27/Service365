import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payment";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: { message: "Payment ID is required" } },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();
    const executeResult = await provider.executePayment(paymentId);

    if (!executeResult.success || executeResult.status !== "SUCCESS") {
      return NextResponse.json(
        { success: false, error: { message: executeResult.errorMessage || "Payment execution declined by gateway" } },
        { status: 400 }
      );
    }

    if (isDatabaseConfigured) {
      // Find matching payment record
      const paymentRecord = await prisma.payment.findFirst({
        where: { gatewayPaymentId: paymentId },
        include: { order: true },
      });

      if (paymentRecord) {
        // Prevent duplicate execution
        if (paymentRecord.status === PaymentStatus.SUCCESS) {
          return NextResponse.json({
            success: true,
            transactionId: paymentRecord.transactionId,
            message: "Payment already verified",
          });
        }

        // Transaction safe update
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: paymentRecord.id },
            data: {
              status: PaymentStatus.SUCCESS,
              transactionId: executeResult.transactionId,
              gatewayResponse: JSON.stringify(executeResult.rawResponse || {}),
            },
          }),
          prisma.order.update({
            where: { id: paymentRecord.orderId },
            data: {
              paymentStatus: PaymentStatus.SUCCESS,
            },
          }),
          prisma.trackingEvent.create({
            data: {
              orderId: paymentRecord.orderId,
              status: paymentRecord.order.status,
              message: `Payment confirmed via bKash. Transaction ID: ${executeResult.transactionId || "N/A"}.`,
              location: "bKash Online Gateway",
            },
          }),
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: executeResult.transactionId,
      amount: executeResult.amount,
      status: "SUCCESS",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment execution error";
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
