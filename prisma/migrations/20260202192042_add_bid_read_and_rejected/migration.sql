-- AlterTable
ALTER TABLE "bids" ADD COLUMN     "readByOwnerAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedBy" TEXT;

-- CreateIndex
CREATE INDEX "bids_auctionId_readByOwnerAt_idx" ON "bids"("auctionId", "readByOwnerAt");

-- CreateIndex
CREATE INDEX "bids_auctionId_rejectedAt_idx" ON "bids"("auctionId", "rejectedAt");
