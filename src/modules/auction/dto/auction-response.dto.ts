import { Auction, AuctionStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ProductNestedDto } from '../../product/dto/product-nested.dto';
import { toISOString } from '../../../common/utils/date.util';

export class AuctionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  creatorId!: string;

  @ApiProperty()
  startPrice!: number;

  @ApiProperty()
  currentPrice!: number;

  @ApiProperty()
  bidIncrement!: number;

  @ApiProperty()
  minBidAmount!: number;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  startTime!: string;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  endTime!: string | null;

  @ApiProperty()
  durationHours!: number;

  @ApiProperty({
    enum: AuctionStatus,
    description: 'Auction status',
    example: 'ACTIVE',
  })
  status!: string;

  @ApiProperty({ nullable: true })
  winnerId!: string | null;

  @ApiProperty()
  autoExtend!: boolean;

  @ApiProperty()
  extendMinutes!: number;

  @ApiProperty()
  views!: number;

  @ApiProperty()
  totalBids!: number;

  @ApiProperty()
  version!: number;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  lastBidAt!: string | null;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ nullable: true, example: '2026-03-01T18:00:00.000Z' })
  deletedAt!: string | null;

  @ApiProperty({ type: () => ProductNestedDto, required: false })
  product?: ProductNestedDto;

  @ApiProperty({ required: false })
  creator?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  };

  @ApiProperty({ nullable: true, required: false })
  winner?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  } | null;

  @ApiProperty({ nullable: true, required: false })
  chatId?: string | null;

  static fromEntity(
    auction: Auction & {
      product?: {
        id: string;
        title: unknown;
        slug: string;
        price: unknown;
        images?: Array<{ fileId: string; file?: { url: string } }>;
      };
      creator?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
      };
      winner?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
      } | null;
    },
  ): AuctionResponseDto {
    return {
      id: auction.id,
      productId: auction.productId,
      creatorId: auction.creatorId,
      startPrice: Number(auction.startPrice),
      currentPrice: Number(auction.currentPrice),
      bidIncrement: Number(auction.bidIncrement),
      minBidAmount: Number(auction.minBidAmount),
      startTime: toISOString(auction.startTime) ?? '',
      endTime:
        auction.status === AuctionStatus.PENDING
          ? new Date(
            Date.now() + (auction.durationHours || 2) * 60 * 60 * 1000,
          ).toISOString()
          : toISOString(auction.endTime),
      durationHours: auction.durationHours,
      status: auction.status,
      winnerId: auction.winnerId,
      autoExtend: auction.autoExtend,
      extendMinutes: auction.extendMinutes,
      views: auction.views,
      totalBids: auction.totalBids,
      version: auction.version,
      lastBidAt: toISOString(auction.lastBidAt),
      createdAt: toISOString(auction.createdAt) ?? '',
      updatedAt: toISOString(auction.updatedAt) ?? '',
      deletedAt: toISOString(auction.deletedAt),
      product: auction.product
        ? {
            id: auction.product.id,
            title: (auction.product.title as string) ?? '',
            slug: auction.product.slug,
            price:
              typeof auction.product.price === 'number'
                ? auction.product.price
                : Number(auction.product.price) || 0,
            images: auction.product.images?.map((img) => ({
              id: img.fileId,
              url: img.file?.url ?? '',
            })),
          }
        : undefined,
      creator: auction.creator
        ? {
            id: auction.creator.id,
            firstName: auction.creator.firstName,
            lastName: auction.creator.lastName,
            phoneNumber: auction.creator.phoneNumber,
          }
        : undefined,
      winner: auction.winner
        ? {
            id: auction.winner.id,
            firstName: auction.winner.firstName,
            lastName: auction.winner.lastName,
            phoneNumber: auction.winner.phoneNumber,
          }
        : null,
    };
  }
}
