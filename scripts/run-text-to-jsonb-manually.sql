-- =============================================================================
-- RUN THIS IN YOUR DATABASE CLIENT (TablePlus, DBeaver, psql, etc.)
-- Connect to the SAME database as your app (check DATABASE_URL in .env)
-- =============================================================================

-- Step 0: Check current column types (run this first to confirm you're on the right DB)
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('products', 'categories', 'conditions', 'sizes')
  AND column_name IN ('title', 'description', 'name')
ORDER BY table_name, column_name;
-- You should see text/character varying. After this script, run again and see jsonb.

-- =============================================================================
-- Step 1: Convert categories
-- =============================================================================
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

-- =============================================================================
-- Step 2: Convert conditions
-- =============================================================================
ALTER TABLE "conditions" ADD COLUMN IF NOT EXISTS "name_new" JSONB;
UPDATE "conditions" SET "name_new" = jsonb_build_object('en', COALESCE("name"::text, ''));
ALTER TABLE "conditions" DROP COLUMN IF EXISTS "name";
ALTER TABLE "conditions" RENAME COLUMN "name_new" TO "name";
ALTER TABLE "conditions" ALTER COLUMN "name" SET NOT NULL;

-- =============================================================================
-- Step 3: Convert products
-- =============================================================================
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

-- =============================================================================
-- Step 4: Convert sizes
-- =============================================================================
ALTER TABLE "sizes" ADD COLUMN IF NOT EXISTS "name_new" JSONB;
UPDATE "sizes" SET "name_new" = jsonb_build_object('en', COALESCE("name"::text, ''));
ALTER TABLE "sizes" DROP COLUMN IF EXISTS "name";
ALTER TABLE "sizes" RENAME COLUMN "name_new" TO "name";
ALTER TABLE "sizes" ALTER COLUMN "name" SET NOT NULL;

-- Optional: drop index if it exists (from old schema)
DROP INDEX IF EXISTS "categories_name_key";

-- Done. Run the SELECT from Step 0 again to confirm data_type is now jsonb.
