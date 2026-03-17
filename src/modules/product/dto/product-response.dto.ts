import { Product, ProductImage, ProductStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toISOString } from '../../../common/utils/date.util';

export class ProductImageResponseDto {
  @ApiProperty({
    description: 'File UUID (use this as imageIds item when updating product).',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id!: string;

  @ApiProperty({
    description: 'Public URL of the image.',
    example: 'https://cdn.example.com/images/rose.jpg',
  })
  url!: string;

  static fromEntity(
    image: ProductImage & { file?: { url: string } },
  ): ProductImageResponseDto {
    return {
      id: image.fileId,
      url: image.file?.url ?? '',
    };
  }
}

export class ProductResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Red Roses Bouquet', nullable: true })
  title!: string | null;

  @ApiProperty({ example: 'red-roses-bouquet' })
  slug!: string;

  @ApiProperty({
    nullable: true,
    example: 'Beautiful fresh red roses bouquet. 12 stems.',
  })
  description!: string | null;

  @ApiProperty({ example: 150000 })
  price!: number;

  @ApiProperty({ example: 'UZS' })
  currency!: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440010' })
  categoryId?: string | null;

  @ApiProperty({ type: [String], example: ['roses', 'bouquet', 'romantic'] })
  tags!: string[];

  @ApiProperty({ example: 'FRESH' })
  type!: string;

  @ApiProperty({
    required: false,
    description: 'Condition (id, name, slug).',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440020',
      name: 'New',
      slug: 'new',
    },
  })
  condition?: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({
    required: false,
    description: 'Size (id, name, slug).',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440021',
      name: 'Large',
      slug: 'large',
    },
  })
  size?: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({ description: 'Quantity available.', example: 10 })
  quantity!: number;

  @ApiProperty({
    enum: ProductStatus,
    description: 'Product status',
    example: 'PUBLISHED',
  })
  status!: string;

  @ApiProperty({
    description: 'Whether the product is featured on homepage.',
    example: true,
  })
  isFeatured!: boolean;

  @ApiProperty({ description: 'View count.', example: 45 })
  views!: number;

  @ApiProperty({
    nullable: true,
    description: 'Region (e.g. Tashkent).',
    example: 'Tashkent',
  })
  region!: string | null;

  @ApiProperty({ nullable: true, example: 'Tashkent' })
  city!: string | null;

  @ApiProperty({ nullable: true, example: 'Mirobod' })
  district!: string | null;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440030' })
  sellerId!: string;

  @ApiProperty({ example: '2026-01-04T17:15:29.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-04T17:15:29.000Z' })
  updatedAt!: string;

  @ApiProperty({ nullable: true, example: '2026-01-04T17:15:29.000Z' })
  deletedAt!: string | null;

  @ApiProperty({
    required: false,
    description: 'Category (id, name, slug).',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440010',
      name: 'Roses',
      slug: 'roses',
    },
  })
  category?: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({
    required: false,
    description: 'Seller.',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440030',
      firstName: 'Ali',
      lastName: 'Karimov',
      phoneNumber: '+998901234569',
    },
  })
  seller?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  };

  @ApiProperty({
    type: () => [ProductImageResponseDto],
    required: false,
    description:
      'Product images. Each item has id (file UUID—use in PATCH imageIds) and url. Ordered by display order.',
  })
  images?: ProductImageResponseDto[];

  @ApiProperty({
    required: false,
    description:
      'Active auction (id, endTime, status, currentPrice, totalBids, winner). Use id for GET /bids?auctionId=:auctionId. winner is set when auction has ended.',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440040',
      endTime: '2026-01-05T17:15:29.000Z',
      status: 'PUBLISHED',
      currentPrice: 100000,
      totalBids: 3,
      winner: null,
    },
  })
  activeAuction?: {
    id: string;
    endTime: string;
    status: string;
    currentPrice: number;
    totalBids: number;
    winner?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string;
    } | null;
  } | null;

  @ApiPropertyOptional({
    description:
      'Last order for this product (Sell section: sold / awaiting delivery). For card: status, deliveredAt, shippedAt.',
  })
  saleOrderSummary?: {
    orderId: string;
    status: string;
    deliveredAt?: string | null;
    shippedAt?: string | null;
  };

  @ApiPropertyOptional({
    description:
      'High-level sale status for buyers: available, onAuction, awaitingDelivery, sold.',
    enum: ['available', 'onAuction', 'awaitingDelivery', 'sold'],
  })
  saleStatus?: 'available' | 'onAuction' | 'awaitingDelivery' | 'sold';

  static fromEntity(
    product: Product & {
      category?: { id: string; name: unknown; slug: string } | null;
      condition?: { id: string; name: unknown; slug: string } | null;
      size?: { id: string; name: unknown; slug: string } | null;
      seller?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
      };
      regionRelation?: { name: unknown } | null;
      cityRelation?: { name: unknown } | null;
      districtRelation?: { name: unknown } | null;
      images?: (ProductImage & { file?: { url: string } })[];
      activeAuction?: {
        id: string;
        endTime: Date;
        status: string;
        currentPrice: unknown;
        totalBids: number;
        winner?: {
          id: string;
          firstName: string | null;
          lastName: string | null;
          phoneNumber: string;
        } | null;
      };
      saleOrderSummary?: {
        id: string;
        status: string;
        deliveredAt: Date | null;
        shippedAt: Date | null;
      };
      saleStatus?: 'available' | 'onAuction' | 'awaitingDelivery' | 'sold';
    },
  ): ProductResponseDto {
    return {
      id: product.id,
      title:
        product.title != null ? (product.title as unknown as string) : null,
      slug: product.slug,
      description: product.description as unknown as string | null,
      price: Number(product.price),
      currency: product.currency,
      categoryId: product.categoryId,
      tags: product.tags,
      type: product.type,
      condition: product.condition
        ? {
            id: product.condition.id,
            name: product.condition.name as string,
            slug: product.condition.slug,
          }
        : undefined,
      size: product.size
        ? {
            id: product.size.id,
            name: product.size.name as string,
            slug: product.size.slug,
          }
        : undefined,
      quantity: product.quantity,
      status: product.status,
      isFeatured: product.isFeatured,
      views: product.views,
      region: (product.regionRelation?.name ?? null) as string | null,
      city: (product.cityRelation?.name ?? null) as string | null,
      district: (product.districtRelation?.name ?? null) as string | null,
      sellerId: product.sellerId,
      createdAt: toISOString(product.createdAt) ?? '',
      updatedAt: toISOString(product.updatedAt) ?? '',
      deletedAt: toISOString(product.deletedAt),
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name as string,
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
            endTime:
              product.activeAuction.endTime instanceof Date
                ? product.activeAuction.endTime.toISOString()
                : new Date(
                    product.activeAuction.endTime as unknown as string | number,
                  ).toISOString(),
            status: product.activeAuction.status,
            currentPrice:
              typeof product.activeAuction.currentPrice === 'number'
                ? product.activeAuction.currentPrice
                : Number(product.activeAuction.currentPrice) || 0,
            totalBids: product.activeAuction.totalBids,
            winner: product.activeAuction.winner
              ? {
                  id: product.activeAuction.winner.id,
                  firstName: product.activeAuction.winner.firstName,
                  lastName: product.activeAuction.winner.lastName,
                  phoneNumber: product.activeAuction.winner.phoneNumber,
                }
              : null,
          }
        : null,
      saleOrderSummary: product.saleOrderSummary
        ? {
            orderId: product.saleOrderSummary.id,
            status: product.saleOrderSummary.status,
            deliveredAt:
              toISOString(product.saleOrderSummary.deliveredAt) ?? undefined,
            shippedAt:
              toISOString(product.saleOrderSummary.shippedAt) ?? undefined,
          }
        : undefined,
      saleStatus: product.saleStatus,
    };
  }
}
