/*
  Warnings:

  - You are about to drop the column `condition` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "condition",
ADD COLUMN     "conditionId" TEXT,
ADD COLUMN     "sizeId" TEXT;

-- AlterTable
ALTER TABLE "verification_codes" ALTER COLUMN "phoneCountryCode" DROP DEFAULT;

-- DropEnum
DROP TYPE "ProductCondition";

-- CreateTable
CREATE TABLE "conditions" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conditions_slug_key" ON "conditions"("slug");

-- CreateIndex
CREATE INDEX "conditions_slug_idx" ON "conditions"("slug");

-- CreateIndex
CREATE INDEX "conditions_createdById_idx" ON "conditions"("createdById");

-- CreateIndex
CREATE INDEX "conditions_isActive_deletedAt_idx" ON "conditions"("isActive", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sizes_slug_key" ON "sizes"("slug");

-- CreateIndex
CREATE INDEX "sizes_slug_idx" ON "sizes"("slug");

-- CreateIndex
CREATE INDEX "sizes_createdById_idx" ON "sizes"("createdById");

-- CreateIndex
CREATE INDEX "sizes_isActive_deletedAt_idx" ON "sizes"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "products_conditionId_idx" ON "products"("conditionId");

-- CreateIndex
CREATE INDEX "products_sizeId_idx" ON "products"("sizeId");

-- AddForeignKey
ALTER TABLE "conditions" ADD CONSTRAINT "conditions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sizes" ADD CONSTRAINT "sizes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "verification_codes_phoneCountryCode_phoneNumber_expiresAt_isUse" RENAME TO "verification_codes_phoneCountryCode_phoneNumber_expiresAt_i_idx";
