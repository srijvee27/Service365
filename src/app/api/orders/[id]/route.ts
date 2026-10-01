import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { OrderStatus, CodStatus, Role, WalletTransactionType } from "@prisma/client";
import { NotificationTemplates, getSmsProvider } from "@/lib/notifications";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const { id } = await params;

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: false, error: { message: "Database not configured" } }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { trackingId: id },
          { orderNumber: id },
          { orderId: id }
        ]
      },
      include: {
        items: true,
        trackingEvents: { orderBy: { createdAt: "desc" } },
        assignments: { include: { rider: { include: { user: true } } } },
        merchant: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: { message: "Order not found" } }, { status: 404 });
    }

    // Role-based access control
    if (session.role === Role.MERCHANT && order.merchantId !== session.merchantId) {
      return NextResponse.json({ success: false, error: { message: "Forbidden" } }, { status: 403 });
    }
    if (session.role === Role.CUSTOMER && order.customerId !== session.customerId) {
      return NextResponse.json({ success: false, error: { message: "Forbidden" } }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching order";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error } = await requireAuth();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: error || "Unauthorized" } }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, orderDate, riderId, message, location } = body;

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Order status updated (mock mode)" });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }, { trackingId: id }],
      },
      include: { merchant: { include: { wallet: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: { message: "Order not found" } }, { status: 404 });
    }

    // Role-based authorization
    if (session.role === Role.MERCHANT) {
      let merchantId = session.merchantId;
      if (!merchantId) {
        const m = await prisma.merchant.findUnique({
          where: { userId: session.id },
        });
        merchantId = m?.id;
      }
      if (!merchantId || order.merchantId !== merchantId) {
        return NextResponse.json(
          { success: false, error: { message: "Forbidden: You cannot modify another merchant's order." } },
          { status: 403 }
        );
      }
    } else if (session.role !== Role.SUPER_ADMIN && session.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden: Administrative or Merchant authorization required." } },
        { status: 403 }
      );
    }

    // Optional orderDate validation
    let parsedOrderDate: Date | undefined = undefined;
    if (orderDate) {
      parsedOrderDate = new Date(orderDate);
      if (isNaN(parsedOrderDate.getTime())) {
        return NextResponse.json(
          { success: false, error: { message: "Invalid Order Date format. Expected YYYY-MM-DD" } },
          { status: 400 }
        );
      }
    }

    // Status validation if provided
    const targetStatus = (status || order.status) as OrderStatus;
    const validStatuses = Object.values(OrderStatus);
    if (status && !validStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { success: false, error: { message: `Invalid order status: ${status}` } },
        { status: 400 }
      );
    }

    // If status and date have not changed, return success without creating duplicate events
    if (order.status === targetStatus && !parsedOrderDate) {
      return NextResponse.json({ success: true, data: order, message: "No changes detected" });
    }

    // State machine updates inside transaction
    const updated = await prisma.$transaction(async (tx) => {
      const isDelivered = targetStatus === OrderStatus.DELIVERED;
      const isFailed = targetStatus === OrderStatus.DELIVERY_FAILED;

      // Update Order
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: targetStatus,
          orderDate: parsedOrderDate,
          deliveredAt: isDelivered ? new Date() : undefined,
          codStatus: isDelivered && order.paymentMethod === "COD" ? CodStatus.COLLECTED : order.codStatus,
        },
      });

      // Append immutable tracking event
      await tx.trackingEvent.create({
        data: {
          orderId: order.id,
          status: targetStatus,
          message: message || `Order status updated to ${targetStatus.replace(/_/g, " ")}.`,
          location: location || `${order.receiverArea || order.receiverDistrict} Hub`,
          actorId: session.id,
          actorRole: session.role,
        },
      });

      // Rider Assignment if assigned
      if (riderId) {
        await tx.riderAssignment.create({
          data: {
            orderId: order.id,
            riderId,
            assignmentType: targetStatus === OrderStatus.PICKUP_REQUESTED ? "PICKUP" : "DELIVERY",
            status: "ASSIGNED",
          },
        });
      }

      // If parcel marked DELIVERED and has COD, credit merchant wallet and COD transaction
      if (isDelivered && order.paymentMethod === "COD" && order.merchantId) {
        // Update COD transaction
        await tx.codTransaction.updateMany({
          where: { orderId: order.id },
          data: {
            status: CodStatus.COLLECTED,
            collectedAt: new Date(),
          },
        });

        // Credit Merchant Wallet
        if (order.merchant?.wallet) {
          const netCredit = Number(order.codAmount) - Number(order.codFee) - Number(order.totalCharge);
          const newBalance = Number(order.merchant.wallet.availableBalance) + Math.max(0, netCredit);

          await tx.wallet.update({
            where: { merchantId: order.merchantId },
            data: {
              availableBalance: newBalance,
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: order.merchant.wallet.id,
              type: WalletTransactionType.COD_CREDIT,
              amount: Math.max(0, netCredit),
              balanceAfter: newBalance,
              referenceType: "ORDER",
              referenceId: order.orderNumber,
              notes: `COD Collection for ${order.orderNumber}. Collected: ৳${order.codAmount} less Delivery Charge: ৳${order.totalCharge}`,
            },
          });
        }
      }

      return updatedOrder;
    });

    // Notify recipient if out for delivery or delivered
    if (status === OrderStatus.DELIVERED) {
      const template = NotificationTemplates.delivered(order.trackingId, Number(order.codAmount));
      await getSmsProvider().sendSms({ toPhone: order.receiverPhone, message: template.sms });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating order";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
