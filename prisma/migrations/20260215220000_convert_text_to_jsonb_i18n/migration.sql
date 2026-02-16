/*
  Converts title/description/name from text/varchar to JSONB for i18n.
  Existing values become { "en": "<current value>" }.
  Run only when columns are still text/character varying (not already jsonb).
*/
-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BID_REJECTED';

DROP INDEX IF EXISTS "categories_name_key";

-- ========== categories ==========
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "name_new" JSONB;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description_new" JSONB;
UPDATE "categories" SET
  "name_new" = jsonb_build_object('en', COALESCE("name"::text, '')),
  "description_new" = CASE WHEN "description" IS NULL THEN NULL ELSE jsonb_build_object('en', "description"::text) END;
ALTER TABLE "categories" DROP COLUMN IF EXISTS "name";
ALTER TABLE "categories" DROP COLUMN IF EXISTS "description";
ALTER TABLE "categories" RENAME COLUMN "name_new" TO "name";
ALTER TABLE "categories" RENAME COLUMN "description_new" TO "description";
ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL;

-- ========== conditions ==========
ALTER TABLE "conditions" ADD COLUMN IF NOT EXISTS "name_new" JSONB;
UPDATE "conditions" SET "name_new" = jsonb_build_object('en', COALESCE("name"::text, ''));
ALTER TABLE "conditions" DROP COLUMN IF EXISTS "name";
ALTER TABLE "conditions" RENAME COLUMN "name_new" TO "name";
ALTER TABLE "conditions" ALTER COLUMN "name" SET NOT NULL;

-- ========== products ==========
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "title_new" JSONB;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_new" JSONB;
UPDATE "products" SET
  "title_new" = jsonb_build_object('en', COALESCE("title"::text, '')),
  "description_new" = CASE WHEN "description" IS NULL THEN NULL ELSE jsonb_build_object('en', "description"::text) END;
ALTER TABLE "products" DROP COLUMN IF EXISTS "title";
ALTER TABLE "products" DROP COLUMN IF EXISTS "description";
ALTER TABLE "products" RENAME COLUMN "title_new" TO "title";
ALTER TABLE "products" RENAME COLUMN "description_new" TO "description";
ALTER TABLE "products" ALTER COLUMN "title" SET NOT NULL;

-- ========== sizes ==========
ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "name_new" JSONB;
UPDATE "sizes" SET "name_new" = jsonb_build_object('en', COALESCE("name"::text, ''));
ALTER TABLE "sizes" DROP COLUMN IF EXISTS "name";
ALTER TABLE "sizes" RENAME COLUMN "name_new" TO "name";
ALTER TABLE "sizes" ALTER COLUMN "name" SET NOT NULL;
