/*
  Warnings:

  - The `description` column on the `categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `name` on the `categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `conditions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `title` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `sizes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BID_REJECTED';

-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "conditions" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "sizes" DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL;
