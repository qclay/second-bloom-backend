import { Auction } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ProductNestedDto } from '../../product/dto/product-nested.dto';

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

  @ApiProperty()
  startTime!: Date;

  @ApiProperty()
  endTime!: Date;

  @ApiProperty()
  durationHours!: number;

  @ApiProperty()
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

  @ApiProperty({ nullable: true })
  lastBidAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ nullable: true })
  deletedAt!: Date | null;

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
      startTime: auction.startTime,
      endTime: auction.endTime,
      durationHours: auction.durationHours,
      status: auction.status,
      winnerId: auction.winnerId,
      autoExtend: auction.autoExtend,
      extendMinutes: auction.extendMinutes,
      views: auction.views,
      totalBids: auction.totalBids,
      version: auction.version,
      lastBidAt: auction.lastBidAt,
      createdAt: auction.createdAt,
      updatedAt: auction.updatedAt,
      deletedAt: auction.deletedAt,
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
