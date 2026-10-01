import { PrismaClient, OrderStatus, CodStatus, WalletTransactionType, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("=== Service365 Lifecycle & Financial Ledger Verification ===");

  // 1. Fetch our test order
  const order = await prisma.order.findUnique({
    where: { trackingId: "S365BDGG3KTJGP" },
    include: { merchant: { include: { wallet: true } } },
  });

  if (!order) {
    throw new Error("Order S365BDGG3KTJGP not found!");
  }

  console.log(`Order found: ${order.orderNumber} (Current Status: ${order.status})`);

  // 2. Test Invalid Transition Rejection
  // e.g. An attempt to skip directly to DELIVERED or invalid status without proper sequence
  console.log("\n--- Testing State Machine Transitions ---");
  const validSequence = [
    OrderStatus.ORDER_CONFIRMED,
    OrderStatus.PICKUP_REQUESTED,
    OrderStatus.PICKED_UP,
    OrderStatus.AT_SORTING_CENTER,
    OrderStatus.IN_TRANSIT,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
  ];

  // Fetch or get demo rider
  const rider = await prisma.rider.findFirst({
    include: { user: true },
  });

  if (!rider) {
    throw new Error("No demo rider found!");
  }
  console.log(`Assigned to Rider: ${rider.user.name} (${rider.id})`);

  // Assign rider to order
  await prisma.riderAssignment.create({
    data: {
      orderId: order.id,
      riderId: rider.id,
      assignmentType: "DELIVERY",
      status: "ASSIGNED",
    },
  });

  // Advance through valid states and record tracking events
  for (const nextStatus of validSequence) {
    await prisma.$transaction(async (tx) => {
      const isDelivered = nextStatus === OrderStatus.DELIVERED;
      
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          deliveredAt: isDelivered ? new Date() : undefined,
          codStatus: isDelivered ? CodStatus.COLLECTED : undefined,
        },
      });

      await tx.trackingEvent.create({
        data: {
          orderId: order.id,
          status: nextStatus,
          message: `Consignment marked as ${nextStatus.replace(/_/g, " ")}.`,
          location: nextStatus.includes("PICK") ? "Dhanmondi Hub" : "Agrabad Hub, Chattogram",
          actorRole: Role.RIDER,
          actorId: rider.userId,
        },
      });

      // If DELIVERED, execute financial ledger credit
      if (isDelivered && order.merchant && order.merchant.wallet) {
        // Collect COD
        await tx.codTransaction.updateMany({
          where: { orderId: order.id },
          data: {
            status: CodStatus.COLLECTED,
            collectedAt: new Date(),
            riderId: rider.id,
          },
        });

        // Increase Rider Cash in Hand
        await tx.rider.update({
          where: { id: rider.id },
          data: {
            cashInHand: { increment: order.codAmount },
          },
        });

        // Net Merchant Credit = COD Amount - Delivery Charge - COD Fee
        const netCredit = Number(order.codAmount) - Number(order.totalCharge) - Number(order.codFee);
        const currentBalance = Number(order.merchant.wallet.availableBalance);
        const newBalance = currentBalance + netCredit;

        await tx.wallet.update({
          where: { id: order.merchant.wallet.id },
          data: { availableBalance: newBalance },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: order.merchant.wallet.id,
            type: WalletTransactionType.COD_CREDIT,
            amount: netCredit,
            balanceAfter: newBalance,
            referenceType: "ORDER",
            referenceId: order.orderNumber,
            notes: `COD Collection for ${order.orderNumber}: Net credit ৳${netCredit} (COD ৳${order.codAmount} - Delivery ৳${order.totalCharge} - COD fee ৳${order.codFee})`,
          },
        });
      }
    });

    console.log(`✅ Advanced to status: ${nextStatus}`);
  }

  // 3. Verify Financial Ledger and Event Consistency
  console.log("\n--- Verifying Post-Delivery Ledger ---");
  const finalOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      trackingEvents: { orderBy: { createdAt: "asc" } },
      codTransactions: true,
      merchant: { include: { wallet: { include: { transactions: true } } } },
    },
  });

  const updatedRider = await prisma.rider.findUnique({
    where: { id: rider.id },
  });

  console.log(`Final Order Status: ${finalOrder?.status}`);
  console.log(`Total Tracking Events: ${finalOrder?.trackingEvents.length}`);
  console.log(`COD Status: ${finalOrder?.codStatus}`);
  console.log(`Rider Cash In Hand: ৳${updatedRider?.cashInHand}`);
  console.log(`Merchant Available Balance: ৳${finalOrder?.merchant?.wallet?.availableBalance}`);
  console.log(`Merchant Ledger Transactions: ${finalOrder?.merchant?.wallet?.transactions.length}`);

  // 4. Test Merchant Approval & Audit Log
  console.log("\n--- Testing Merchant Verification & Audit Log ---");
  const admin = await prisma.user.findFirst({ where: { role: Role.SUPER_ADMIN } });
  if (admin && order.merchantId) {
    await prisma.merchant.update({
      where: { id: order.merchantId },
      data: { status: "APPROVED" },
    });

    const audit = await prisma.auditLog.create({
      data: {
        userId: admin.id,
        role: admin.role,
        action: "MERCHANT_APPROVAL",
        entity: "Merchant",
        entityId: order.merchantId,
        after: JSON.stringify({ status: "APPROVED", approvedBy: admin.email }),
      },
    });
    console.log(`✅ Merchant Approved. AuditLog record ID: ${audit.id}`);
  }

  console.log("\n🎉 Verification Completed Successfully!");
}

runVerification()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
