/*
  Warnings:

  - You are about to drop the column `gatewayResponse` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `packageId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `publication_packages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_packageId_fkey";

-- DropIndex
DROP INDEX "payments_packageId_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "gatewayResponse",
DROP COLUMN "packageId";

-- DropTable
DROP TABLE "publication_packages";

-- CreateTable
CREATE TABLE "publication_pricing" (
    "id" TEXT NOT NULL,
    "pricePerPost" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publication_pricing_pkey" PRIMARY KEY ("id")
);
