import { prisma } from "../src/lib/db";

async function main() {
  const orders = await prisma.order.findMany({
    select: {
      trackingId: true,
      orderNumber: true,
      status: true,
      trackingEvents: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          status: true,
          message: true,
          actorRole: true,
          createdAt: true,
        },
      },
    },
    take: 5,
  });

  console.log("DB_ORDERS_AND_EVENTS:", JSON.stringify(orders, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
