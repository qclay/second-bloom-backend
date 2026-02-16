-- AlterTable
ALTER TABLE "conversations" ADD COLUMN "productId" TEXT,
ADD COLUMN "orderId" TEXT;

-- CreateIndex
CREATE INDEX "conversations_productId_idx" ON "conversations"("productId");

-- CreateIndex
CREATE INDEX "conversations_orderId_idx" ON "conversations"("orderId");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
