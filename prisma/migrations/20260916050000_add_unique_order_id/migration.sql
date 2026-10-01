-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "order_id_seq" START WITH 100001;

-- AlterTable: Add column as nullable first to safely backfill
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderId" TEXT;

-- Backfill existing orders with unique, sequential Order IDs starting at #100001
UPDATE "Order"
SET "orderId" = '#' || nextval('order_id_seq')
WHERE "orderId" IS NULL;

-- Set column default for all future orders
ALTER TABLE "Order" ALTER COLUMN "orderId" SET DEFAULT ('#'::text || nextval('order_id_seq'::regclass));

-- Make it NOT NULL
ALTER TABLE "Order" ALTER COLUMN "orderId" SET NOT NULL;

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_orderId_idx" ON "Order"("orderId");
