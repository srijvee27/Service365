-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing orders with their creation timestamp
UPDATE "Order" SET "orderDate" = "createdAt";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_orderDate_idx" ON "Order"("orderDate");
