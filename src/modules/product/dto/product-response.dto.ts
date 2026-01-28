import { Product, ProductImage } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fileId!: string;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ required: false })
  url?: string;

  static fromEntity(
    image: ProductImage & { file?: { url: string } },
  ): ProductImageResponseDto {
    return {
      id: image.id,
      fileId: image.fileId,
      order: image.order,
      createdAt: image.createdAt,
      url: image.file?.url,
    };
  }
}

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty()
  type!: string;

  @ApiProperty({ nullable: true })
  condition!: string | null;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  isFeatured!: boolean;

  @ApiProperty()
  views!: number;

  @ApiProperty({ nullable: true })
  region!: string | null;

  @ApiProperty({ nullable: true })
  city!: string | null;

  @ApiProperty({ nullable: true })
  district!: string | null;

  @ApiProperty()
  sellerId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ required: false })
  category?: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({ required: false })
  seller?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  };

  @ApiProperty({ type: () => [ProductImageResponseDto], required: false })
  images?: ProductImageResponseDto[];

  @ApiProperty({
    required: false,
    description:
      'Active auction for this product (when includeActiveAuction=true). Use id for GET /bids/auction/:auctionId and endTime for timer.',
  })
  activeAuction?: {
    id: string;
    endTime: Date;
    status: string;
    currentPrice: number;
    totalBids: number;
  };

  static fromEntity(
    product: Product & {
      category?: { id: string; name: string; slug: string };
      seller?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
      };
      images?: (ProductImage & { file?: { url: string } })[];
      activeAuction?: {
        id: string;
        endTime: Date;
        status: string;
        currentPrice: unknown;
        totalBids: number;
      };
    },
  ): ProductResponseDto {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      currency: product.currency,
      categoryId: product.categoryId,
      tags: product.tags,
      type: product.type,
      condition: product.condition,
      quantity: product.quantity,
      status: product.status,
      isFeatured: product.isFeatured,
      views: product.views,
      region: product.region,
      city: product.city,
      district: product.district,
      sellerId: product.sellerId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : undefined,
      seller: product.seller
        ? {
            id: product.seller.id,
            firstName: product.seller.firstName,
            lastName: product.seller.lastName,
            phoneNumber: product.seller.phoneNumber,
          }
        : undefined,
      images: product.images
        ? product.images.map((img) => ProductImageResponseDto.fromEntity(img))
        : undefined,
      activeAuction: product.activeAuction
        ? {
            id: product.activeAuction.id,
            endTime: product.activeAuction.endTime,
            status: product.activeAuction.status,
            currentPrice:
              typeof product.activeAuction.currentPrice === 'number'
                ? product.activeAuction.currentPrice
                : Number(product.activeAuction.currentPrice) || 0,
            totalBids: product.activeAuction.totalBids,
          }
        : undefined,
    };
  }
}
