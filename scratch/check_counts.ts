import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const counts = {
    Users: await prisma.user.count(),
    Divisions: await prisma.division.count(),
    Districts: await prisma.district.count(),
    Areas: await prisma.area.count(),
    PricingRules: await prisma.pricingRule.count(),
    Orders: await prisma.order.count(),
    TrackingEvents: await prisma.trackingEvent.count(),
    Wallets: await prisma.wallet.count(),
    WalletTransactions: await prisma.walletTransaction.count(),
    Payments: await prisma.payment.count(),
    CodTransactions: await prisma.codTransaction.count(),
    AuditLogs: await prisma.auditLog.count(),
  };
  console.log("DATABASE_RECORD_AUDIT:", JSON.stringify(counts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
