import { Bid } from '@prisma/client';

export class BidResponseDto {
  id!: string;
  auctionId!: string;
  bidderId!: string;
  amount!: number;
  isWinning!: boolean;
  isRetracted!: boolean;
  readByOwnerAt!: Date | null;
  isNew!: boolean;
  rejectedAt!: Date | null;
  rejectedBy!: string | null;
  ipAddress!: string | null;
  userAgent!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  auction?: {
    id: string;
    productId: string;
    currentPrice: number;
    status: string;
    endTime: Date;
    product?: {
      id: string;
      title: string;
      slug: string;
    };
  };
  bidder?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
    avatarUrl: string | null;
  };

  static fromEntity(
    bid: Bid & {
      auction?: {
        id: string;
        productId: string;
        currentPrice: unknown;
        status: string;
        endTime: Date;
        product?: {
          id: string;
          title: unknown;
          slug: string;
        };
      };
      bidder?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
        avatar?: { url: string } | null;
      };
    },
  ): BidResponseDto {
    return {
      id: bid.id,
      auctionId: bid.auctionId,
      bidderId: bid.bidderId,
      amount: Number(bid.amount),
      isWinning: bid.isWinning,
      isRetracted: bid.isRetracted,
      readByOwnerAt: bid.readByOwnerAt ?? null,
      isNew: bid.readByOwnerAt == null && bid.rejectedAt == null,
      rejectedAt: bid.rejectedAt ?? null,
      rejectedBy: bid.rejectedBy ?? null,
      ipAddress: bid.ipAddress,
      userAgent: bid.userAgent,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      auction: bid.auction
        ? {
            id: bid.auction.id,
            productId: bid.auction.productId,
            currentPrice:
              typeof bid.auction.currentPrice === 'number'
                ? bid.auction.currentPrice
                : Number(bid.auction.currentPrice) || 0,
            status: bid.auction.status,
            endTime: bid.auction.endTime,
            product: bid.auction.product
              ? {
                  id: bid.auction.product.id,
                  title: (bid.auction.product.title as string) ?? '',
                  slug: bid.auction.product.slug,
                }
              : undefined,
          }
        : undefined,
      bidder: bid.bidder
        ? {
            id: bid.bidder.id,
            firstName: bid.bidder.firstName,
            lastName: bid.bidder.lastName,
            phoneNumber: bid.bidder.phoneNumber,
            avatarUrl: bid.bidder.avatar?.url ?? null,
          }
        : undefined,
    };
  }
}
