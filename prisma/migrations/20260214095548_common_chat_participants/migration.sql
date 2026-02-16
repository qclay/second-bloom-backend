/*
  Warnings:

  - The values [PENDING,SOLD] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `buyerId` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `buyerLastSeenAt` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `isArchivedByBuyer` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `isArchivedBySeller` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `isBlockedByBuyer` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `isBlockedBySeller` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `sellerLastSeenAt` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `unreadCountByBuyer` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `unreadCountBySeller` on the `conversations` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "public"."products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_orderId_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_productId_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_sellerId_fkey";

-- DropIndex
DROP INDEX "conversations_buyerId_deletedAt_idx";

-- DropIndex
DROP INDEX "conversations_buyerId_isArchivedByBuyer_lastMessageAt_idx";

-- DropIndex
DROP INDEX "conversations_orderId_idx";

-- DropIndex
DROP INDEX "conversations_productId_idx";

-- DropIndex
DROP INDEX "conversations_sellerId_buyerId_orderId_key";

-- DropIndex
DROP INDEX "conversations_sellerId_buyerId_productId_key";

-- DropIndex
DROP INDEX "conversations_sellerId_deletedAt_idx";

-- DropIndex
DROP INDEX "conversations_sellerId_isArchivedBySeller_lastMessageAt_idx";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "buyerId",
DROP COLUMN "buyerLastSeenAt",
DROP COLUMN "isArchivedByBuyer",
DROP COLUMN "isArchivedBySeller",
DROP COLUMN "isBlockedByBuyer",
DROP COLUMN "isBlockedBySeller",
DROP COLUMN "orderId",
DROP COLUMN "productId",
DROP COLUMN "sellerId",
DROP COLUMN "sellerLastSeenAt",
DROP COLUMN "unreadCountByBuyer",
DROP COLUMN "unreadCountBySeller";

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversation_participants_userId_isArchived_idx" ON "conversation_participants"("userId", "isArchived");

-- CreateIndex
CREATE INDEX "conversation_participants_userId_idx" ON "conversation_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "conversation_participants"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "auctions_status_endTime_deletedAt_idx" ON "auctions"("status", "endTime", "deletedAt");

-- CreateIndex
CREATE INDEX "orders_productId_idx" ON "orders"("productId");

-- CreateIndex
CREATE INDEX "orders_productId_createdAt_idx" ON "orders"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
