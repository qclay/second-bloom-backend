import { Product, ProductImage } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id!: string;

  @ApiProperty({ example: 'https://cdn.example.com/images/rose.jpg' })
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

  @ApiProperty({ example: 'Red Roses Bouquet' })
  title!: string;

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

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  categoryId!: string;

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
    description: 'Product status: ACTIVE, INACTIVE, PENDING, SOLD.',
    example: 'ACTIVE',
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
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-04T17:15:29.000Z' })
  updatedAt!: Date;

  @ApiProperty({ nullable: true })
  deletedAt!: Date | null;

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
    description: 'Images (id, fileId, order, url).',
  })
  images?: ProductImageResponseDto[];

  @ApiProperty({
    required: false,
    description:
      'Active auction (id, endTime, status, currentPrice, totalBids). Use id for GET /bids/auction/:auctionId.',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440040',
      endTime: '2026-01-05T17:15:29.000Z',
      status: 'ACTIVE',
      currentPrice: 100000,
      totalBids: 3,
    },
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
      condition?: { id: string; name: string; slug: string } | null;
      size?: { id: string; name: string; slug: string } | null;
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
      condition: product.condition
        ? {
            id: product.condition.id,
            name: product.condition.name,
            slug: product.condition.slug,
          }
        : undefined,
      size: product.size
        ? {
            id: product.size.id,
            name: product.size.name,
            slug: product.size.slug,
          }
        : undefined,
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
