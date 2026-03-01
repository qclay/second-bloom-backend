-- AlterTable (uses PENDING_MODERATION added in previous migration)
ALTER TABLE "products" ADD COLUMN     "moderationRejectedAt" TIMESTAMP(3),
ADD COLUMN     "moderationRejectedById" TEXT,
ADD COLUMN     "moderationRejectionReason" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING_MODERATION';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isAdministrationChat" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "language" SET DEFAULT 'ru';
