import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, SettlementStatus, WalletTransactionType } from "@prisma/client";

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
            id: "set_mock_1",
            batchNumber: "STL-2026-0001",
            merchantName: "Star Tech BD",
            paymentMethod: "BKASH",
            accountNumber: "+8801711223344",
            amount: 14500,
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    const settlements = await prisma.settlement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        merchant: { select: { businessName: true, user: { select: { phone: true } } } },
      },
    });

    const formatted = settlements.map((s) => ({
      id: s.id,
      batchNumber: s.settlementNumber,
      merchantName: s.merchant.businessName,
      paymentMethod: s.paymentMethod,
      accountNumber: s.destinationAccount,
      amount: Number(s.amount),
      status: s.status,
      transactionRef: s.transactionReference,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching settlements";
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
    const { settlementId, transactionRef } = body;

    if (!settlementId || !transactionRef) {
      return NextResponse.json({ success: false, error: { message: "Settlement ID and transaction reference required" } }, { status: 400 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({ success: true, message: "Settlement marked SETTLED (mock)" });
    }

    // Transaction-safe settlement execution
    const updated = await prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.findUnique({
        where: { id: settlementId },
        include: { merchant: { include: { wallet: true } } },
      });

      if (!settlement) {
        throw new Error("Settlement request not found");
      }

      if (settlement.status === SettlementStatus.SETTLED) {
        throw new Error("Settlement has already been processed");
      }

      // Mark settled
      const res = await tx.settlement.update({
        where: { id: settlementId },
        data: {
          status: SettlementStatus.SETTLED,
          transactionReference: transactionRef,
          processedAt: new Date(),
          approvedBy: session.id,
        },
      });

      // Log wallet transaction for disbursement
      if (settlement.merchant.wallet) {
        await tx.walletTransaction.create({
          data: {
            walletId: settlement.merchant.wallet.id,
            type: WalletTransactionType.PAYOUT_DEBIT,
            amount: settlement.amount,
            balanceAfter: settlement.merchant.wallet.availableBalance,
            referenceType: "SETTLEMENT",
            referenceId: settlement.settlementNumber,
            notes: `Disbursement completed via ${settlement.paymentMethod}. TrxRef: ${transactionRef}`,
          },
        });
      }

      // Log admin audit trail
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "SETTLEMENT_EXECUTED",
          entity: "Settlement",
          entityId: settlement.id,
          after: JSON.stringify({ amount: Number(settlement.amount), transactionRef, settlementNumber: settlement.settlementNumber }),
        },
      });

      return res;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error executing settlement";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
