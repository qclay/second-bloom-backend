-- Add enum value only. PostgreSQL requires this to be committed before using it (see next migration).
ALTER TYPE "ProductStatus" ADD VALUE 'PENDING_MODERATION';
