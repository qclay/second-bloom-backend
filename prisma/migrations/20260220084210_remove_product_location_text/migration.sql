/*
  Warnings:

  - You are about to drop the column `city` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "products_city_idx";

-- DropIndex
DROP INDEX "products_region_city_idx";

-- DropIndex
DROP INDEX "products_region_idx";

-- DropIndex
DROP INDEX "products_status_region_city_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "city",
DROP COLUMN "district",
DROP COLUMN "region";

-- CreateIndex
CREATE INDEX "products_status_regionId_cityId_idx" ON "products"("status", "regionId", "cityId");
