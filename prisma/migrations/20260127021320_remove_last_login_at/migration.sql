-- AlterTable
-- Remove lastLoginAt column from users table
ALTER TABLE "users" DROP COLUMN IF EXISTS "lastLoginAt";
