-- Migration: rename DELIVERY enum value to DELIVERED
-- WARNING: Run on a backup or in maintenance window. This changes enum type and converts existing values.

BEGIN;

-- 1) Rename existing enum type
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";

-- 2) Create new enum type with desired values (order matters if defaults rely on order)
CREATE TYPE "OrderStatus" AS ENUM ('CANCELLED', 'DELIVERED', 'PROCESSING', 'SHIPPED');

-- 3) Convert column(s) using the enum. Adjust table/column name if different in your DB.
-- Replace value 'DELIVERY' with 'DELIVERED' during the cast.
ALTER TABLE "Order"
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING (CASE "status" WHEN 'DELIVERY' THEN 'DELIVERED' ELSE "status" END);

-- 4) If you have a default constraint referencing the enum by text, you may need to update it.
-- Example (uncomment and adapt if needed):
-- ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';

-- 5) Drop the old enum type
DROP TYPE "OrderStatus_old";

COMMIT;
