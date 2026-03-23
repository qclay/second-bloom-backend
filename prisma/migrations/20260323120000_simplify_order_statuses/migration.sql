-- Simplify OrderStatus enum to: PROCESSING, DELIVERY, SHIPPED, CANCELLED
-- Data migration:
-- PENDING -> PROCESSING
-- CONFIRMED -> PROCESSING
-- DELIVERED -> DELIVERY

CREATE TYPE "OrderStatus_new" AS ENUM (
    'CANCELLED',
    'DELIVERY',
    'PROCESSING',
    'SHIPPED'
);

ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "orders"
    ALTER COLUMN "status" TYPE "OrderStatus_new"
    USING (
        CASE
            WHEN "status"::text IN ('PENDING', 'CONFIRMED') THEN 'PROCESSING'
            WHEN "status"::text = 'DELIVERED' THEN 'DELIVERY'
            WHEN "status"::text IN ('PROCESSING', 'SHIPPED', 'CANCELLED') THEN "status"::text
            ELSE 'PROCESSING'
        END
    )::"OrderStatus_new";

ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";

ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
