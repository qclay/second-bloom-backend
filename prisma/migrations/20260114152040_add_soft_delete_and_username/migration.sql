/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "auctions_status_deletedAt_idx";

-- DropIndex
DROP INDEX "messages_isDeleted_idx";

-- AlterTable
ALTER TABLE "auctions" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "bids" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "country" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "verification_codes" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "auctions_isActive_deletedAt_idx" ON "auctions"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "auctions_status_isActive_idx" ON "auctions"("status", "isActive");

-- CreateIndex
CREATE INDEX "bids_isActive_deletedAt_idx" ON "bids"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "conversations_isActive_deletedAt_idx" ON "conversations"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "favorites_isActive_deletedAt_idx" ON "favorites"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "files_isActive_deletedAt_idx" ON "files"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "messages_isDeleted_deletedAt_idx" ON "messages"("isDeleted", "deletedAt");

-- CreateIndex
CREATE INDEX "notifications_isActive_deletedAt_idx" ON "notifications"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "orders_isActive_deletedAt_idx" ON "orders"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "payments_isActive_deletedAt_idx" ON "payments"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "product_images_isActive_deletedAt_idx" ON "product_images"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "products_isActive_deletedAt_idx" ON "products"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "reviews_isActive_deletedAt_idx" ON "reviews"("isActive", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "verification_codes_isActive_deletedAt_idx" ON "verification_codes"("isActive", "deletedAt");
