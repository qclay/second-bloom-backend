-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "packageId" TEXT;

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "auctionEndingSoon" BOOLEAN NOT NULL DEFAULT true,
    "auctionEnded" BOOLEAN NOT NULL DEFAULT true,
    "auctionStarted" BOOLEAN NOT NULL DEFAULT true,
    "newBid" BOOLEAN NOT NULL DEFAULT true,
    "outbid" BOOLEAN NOT NULL DEFAULT true,
    "orderConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "orderShipped" BOOLEAN NOT NULL DEFAULT true,
    "orderDelivered" BOOLEAN NOT NULL DEFAULT true,
    "reviewReceived" BOOLEAN NOT NULL DEFAULT true,
    "newMessage" BOOLEAN NOT NULL DEFAULT true,
    "system" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publication_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_userId_idx" ON "notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_preferences_isActive_deletedAt_idx" ON "notification_preferences"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "publication_packages_isActive_idx" ON "publication_packages"("isActive");

-- CreateIndex
CREATE INDEX "publication_packages_order_idx" ON "publication_packages"("order");

-- CreateIndex
CREATE INDEX "publication_packages_isActive_deletedAt_idx" ON "publication_packages"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "payments_packageId_idx" ON "payments"("packageId");

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "publication_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
