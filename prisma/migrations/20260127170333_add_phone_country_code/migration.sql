-- AlterTable users: add phoneCountryCode, drop lastLoginAt (schema no longer has it), change unique
ALTER TABLE "users" ADD COLUMN "phoneCountryCode" TEXT;

ALTER TABLE "users" DROP COLUMN IF EXISTS "lastLoginAt";

DROP INDEX IF EXISTS "users_phoneNumber_key";

CREATE UNIQUE INDEX "users_phoneCountryCode_phoneNumber_key" ON "users"("phoneCountryCode", "phoneNumber");

CREATE INDEX "users_phoneCountryCode_phoneNumber_idx" ON "users"("phoneCountryCode", "phoneNumber");

-- AlterTable verification_codes: add phoneCountryCode, update indexes
ALTER TABLE "verification_codes" ADD COLUMN "phoneCountryCode" TEXT NOT NULL DEFAULT '';

DROP INDEX IF EXISTS "verification_codes_phoneNumber_code_isUsed_idx";
DROP INDEX IF EXISTS "verification_codes_phoneNumber_expiresAt_isUsed_idx";
DROP INDEX IF EXISTS "verification_codes_phoneNumber_purpose_idx";

CREATE INDEX "verification_codes_phoneCountryCode_phoneNumber_code_isUsed_idx" ON "verification_codes"("phoneCountryCode", "phoneNumber", "code", "isUsed");
CREATE INDEX "verification_codes_phoneCountryCode_phoneNumber_expiresAt_isUsed_idx" ON "verification_codes"("phoneCountryCode", "phoneNumber", "expiresAt", "isUsed");
CREATE INDEX "verification_codes_phoneCountryCode_phoneNumber_purpose_idx" ON "verification_codes"("phoneCountryCode", "phoneNumber", "purpose");
