/*
  Warnings:

  - You are about to drop the column `gatewayOrderId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "payments_gatewayOrderId_idx";

-- DropIndex
DROP INDEX "payments_transactionId_idx";

-- DropIndex
DROP INDEX "payments_transactionId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "gatewayOrderId",
DROP COLUMN "transactionId";
