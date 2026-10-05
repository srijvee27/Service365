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
          { orderId: id },
        ],
      },
      include: {
        items: true,
        trackingEvents: { orderBy: { createdAt: "desc" } },
        assignedRider: { include: { user: { select: { name: true, phone: true } } } },
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
    if (session.role === Role.RIDER) {
      let rId = session.riderId;
      if (!rId) {
        const r = await prisma.rider.findUnique({ where: { userId: session.id } });
        rId = r?.id;
      }
      const isAssigned =
        order.assignedRiderId === rId ||
        order.assignments.some((a) => a.riderId === rId);

      if (!isAssigned) {
        return NextResponse.json({ success: false, error: { message: "Forbidden: Not assigned to this parcel" } }, { status: 403 });
      }
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
    const { status, orderDate, message, location } = body;
    const riderId = body.riderId || body.assignedRiderId;

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Order status updated (mock mode)" });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }, { trackingId: id }],
      },
      include: {
        merchant: { include: { wallet: true } },
        assignments: true,
        assignedRider: { include: { user: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: { message: "Order not found" } }, { status: 404 });
    }

    let riderForSessionId = session.riderId;
    if (!riderForSessionId && session.role === Role.RIDER) {
      const r = await prisma.rider.findUnique({ where: { userId: session.id } });
      riderForSessionId = r?.id;
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
    } else if (session.role === Role.RIDER) {
      const isAssigned =
        order.assignedRiderId === riderForSessionId ||
        order.assignments.some((a) => a.riderId === riderForSessionId);

      if (!isAssigned) {
        return NextResponse.json(
          { success: false, error: { message: "Forbidden: You are not assigned to this delivery." } },
          { status: 403 }
        );
      }
    } else if (session.role !== Role.SUPER_ADMIN && session.role !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden: Administrative or Authorized Agent permission required." } },
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

    // Determine target status
    let targetStatus: OrderStatus = order.status;
    if (status) {
      const validStatuses = Object.values(OrderStatus);
      if (!validStatuses.includes(status as OrderStatus)) {
        return NextResponse.json(
          { success: false, error: { message: `Invalid order status: ${status}` } },
          { status: 400 }
        );
      }
      targetStatus = status as OrderStatus;
    } else if (riderId && order.status === OrderStatus.ORDER_CREATED) {
      targetStatus = OrderStatus.ASSIGNED;
    }

    // Target rider to assign (if admin provides riderId)
    let assignedRiderRecord = null;
    if (riderId) {
      assignedRiderRecord = await prisma.rider.findUnique({
        where: { id: riderId },
        include: { user: true },
      });
      if (!assignedRiderRecord) {
        return NextResponse.json(
          { success: false, error: { message: "Selected rider not found." } },
          { status: 400 }
        );
      }
    }

    // State machine updates inside transaction
    const updated = await prisma.$transaction(async (tx) => {
      const isDelivered = targetStatus === OrderStatus.DELIVERED;

      const updateData: Record<string, unknown> = {
        status: targetStatus,
        orderDate: parsedOrderDate,
      };

      if (isDelivered) {
        updateData.deliveredAt = new Date();
        if (order.paymentMethod === "COD") {
          updateData.codStatus = CodStatus.COLLECTED;
        }
      }

      if (riderId) {
        updateData.assignedRiderId = riderId;
      }

      // Update Order
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: updateData,
      });

      // Rider Assignment tracking
      if (riderId) {
        await tx.riderAssignment.create({
          data: {
            orderId: order.id,
            riderId,
            assignmentType: "DELIVERY",
            status: "ASSIGNED",
          },
        });
      }

      // Append immutable tracking event
      let eventMessage = message;
      if (!eventMessage) {
        if (riderId && assignedRiderRecord) {
          eventMessage = `Assigned to delivery rider ${assignedRiderRecord.user.name} (${assignedRiderRecord.riderId || assignedRiderRecord.id}).`;
        } else {
          eventMessage = `Order status updated to ${targetStatus.replace(/_/g, " ")}.`;
        }
      }

      await tx.trackingEvent.create({
        data: {
          orderId: order.id,
          status: targetStatus,
          message: eventMessage,
          location: location || `${order.receiverArea || order.receiverDistrict} Hub`,
          actorId: session.id,
          actorRole: session.role,
        },
      });

      // If parcel marked DELIVERED:
      if (isDelivered) {
        const activeRiderId = order.assignedRiderId || riderForSessionId || riderId;

        // If COD was collected, increment Rider cashInHand
        if (order.paymentMethod === "COD" && activeRiderId && Number(order.codAmount) > 0) {
          await tx.rider.update({
            where: { id: activeRiderId },
            data: {
              cashInHand: {
                increment: order.codAmount,
              },
            },
          });
        }

        // Mark rider assignments as completed
        if (activeRiderId) {
          await tx.riderAssignment.updateMany({
            where: { orderId: order.id, riderId: activeRiderId },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
            },
          });
        }

        // Update COD transaction and credit Merchant wallet
        if (order.paymentMethod === "COD" && order.merchantId) {
          await tx.codTransaction.updateMany({
            where: { orderId: order.id },
            data: {
              status: CodStatus.COLLECTED,
              collectedAt: new Date(),
            },
          });

          if (order.merchant?.wallet) {
            const deliveryCharge = Number(order.baseCharge) + Number(order.weightCharge);
            const totalDeductions = deliveryCharge + Number(order.codFee);
            const netCredit = Math.max(0, Number(order.codAmount) - totalDeductions);
            const newBalance = Number(order.merchant.wallet.availableBalance) + netCredit;

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
      }

      return updatedOrder;
    });

    // Notify recipient if delivered
    if (targetStatus === OrderStatus.DELIVERED) {
      try {
        const template = NotificationTemplates.delivered(order.trackingId, Number(order.codAmount));
        await getSmsProvider().sendSms({ toPhone: order.receiverPhone, message: template.sms });
      } catch {
        // Notification failure should not fail transaction
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating order";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
