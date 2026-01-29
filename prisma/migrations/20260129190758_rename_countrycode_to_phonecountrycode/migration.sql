/*
  Warnings:

  - You are about to drop the column `countryCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `verification_codes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneCountryCode,phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneCountryCode` to the `verification_codes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_countryCode_phoneNumber_idx";

-- DropIndex
DROP INDEX "users_countryCode_phoneNumber_key";

-- DropIndex
DROP INDEX "verification_codes_countryCode_phoneNumber_code_isUsed_idx";

-- DropIndex
DROP INDEX "verification_codes_countryCode_phoneNumber_expiresAt_isUsed_idx";

-- DropIndex
DROP INDEX "verification_codes_countryCode_phoneNumber_purpose_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "countryCode",
ADD COLUMN     "phoneCountryCode" TEXT;

-- AlterTable
ALTER TABLE "verification_codes" DROP COLUMN "countryCode",
ADD COLUMN     "phoneCountryCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "users_phoneCountryCode_phoneNumber_idx" ON "users"("phoneCountryCode", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneCountryCode_phoneNumber_key" ON "users"("phoneCountryCode", "phoneNumber");

-- CreateIndex
CREATE INDEX "verification_codes_phoneCountryCode_phoneNumber_code_isUsed_idx" ON "verification_codes"("phoneCountryCode", "phoneNumber", "code", "isUsed");

-- CreateIndex
CREATE INDEX "verification_codes_phoneCountryCode_phoneNumber_expiresAt_i_idx" ON "verification_codes"("phoneCountryCode", "phoneNumber", "expiresAt", "isUsed");

-- CreateIndex
CREATE INDEX "verification_codes_phoneCountryCode_phoneNumber_purpose_idx" ON "verification_codes"("phoneCountryCode", "phoneNumber", "purpose");
