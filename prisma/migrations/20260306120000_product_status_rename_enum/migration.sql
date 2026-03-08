-- Create new ProductStatus enum with clearer values: DRAFT, PENDING, PUBLISHED, REJECTED
CREATE TYPE "ProductStatus_new" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');

-- Update products to use new enum (map old -> new)
ALTER TABLE "products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "ProductStatus_new" USING (
  CASE "status"::text
    WHEN 'PENDING_MODERATION' THEN 'PENDING'::"ProductStatus_new"
    WHEN 'ACTIVE' THEN 'PUBLISHED'::"ProductStatus_new"
    WHEN 'INACTIVE' THEN 'DRAFT'::"ProductStatus_new"
    ELSE 'PENDING'::"ProductStatus_new"
  END
);

-- Swap enum types
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";

-- Set default and drop old enum
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"ProductStatus";
DROP TYPE "ProductStatus_old";
