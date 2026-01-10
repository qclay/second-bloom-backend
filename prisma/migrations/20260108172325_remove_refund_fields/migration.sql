/*
  Warnings:

  - You are about to drop the column `errorMessage` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `refundReason` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `refundedBy` on the `payments` table. All the data in the column will be lost.
  - Added the required column `userId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PUBLICATION', 'TOP_UP');

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_orderId_fkey";

-- DropIndex
DROP INDEX "payments_orderId_idx";

-- DropIndex
DROP INDEX "payments_orderId_status_idx";

-- DropIndex
DROP INDEX "payments_refundedAt_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "errorMessage",
DROP COLUMN "metadata",
DROP COLUMN "orderId",
DROP COLUMN "refundReason",
DROP COLUMN "refundedAt",
DROP COLUMN "refundedBy",
ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'PUBLICATION',
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "publicationPaymentId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "publicationCredits" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_paymentType_idx" ON "payments"("paymentType");

-- CreateIndex
CREATE INDEX "payments_userId_paymentType_idx" ON "payments"("userId", "paymentType");

-- CreateIndex
CREATE INDEX "payments_userId_status_idx" ON "payments"("userId", "status");

-- CreateIndex
CREATE INDEX "products_publicationPaymentId_idx" ON "products"("publicationPaymentId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_publicationPaymentId_fkey" FOREIGN KEY ("publicationPaymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
