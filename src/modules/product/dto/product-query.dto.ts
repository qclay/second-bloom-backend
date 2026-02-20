import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, ProductStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto {
  @ApiPropertyOptional({
    description: 'Search in title, slug, description, tags.',
    example: 'roses',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID (from GET /categories).',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by seller (user) ID.' })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({
    description: 'Filter featured products only.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by product type.',
    enum: ProductType,
  })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional({
    description:
      'Sell section: filter by tab. Use with sellerId = current user. all = All bouquets (user’s products), in_auction = On auction (user’s products with active auction), sold = Sold (order delivered or auction ended), in_delivery = Awaiting delivery (order confirmed/shipped, not yet delivered).',
    enum: ['all', 'in_auction', 'sold', 'in_delivery'],
    example: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'in_auction', 'sold', 'in_delivery'])
  salePhase?: 'all' | 'in_auction' | 'sold' | 'in_delivery';

  @ApiPropertyOptional({
    description: 'Filter by status; omit for active only.',
    enum: ProductStatus,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Filter by region ID (from GET /locations/regions).',
  })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by city ID (from GET /locations/cities).',
  })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by district ID (from GET /locations/districts).',
  })
  @IsOptional()
  @IsString()
  districtId?: string;

  @ApiPropertyOptional({
    description: 'Filter by condition ID (from GET /conditions).',
  })
  @IsOptional()
  @IsString()
  conditionId?: string;

  @ApiPropertyOptional({ description: 'Filter by size ID (from GET /sizes).' })
  @IsOptional()
  @IsString()
  sizeId?: string;

  @ApiPropertyOptional({
    description: 'Minimum price (inclusive).',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price (inclusive).',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Page number (1-based).',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page.',
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description:
      'Sort field: city, price (use sortOrder asc for low→high), createdAt, new (newest first), rating (seller rating), views.',
    enum: ['city', 'price', 'createdAt', 'new', 'rating', 'views'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['city', 'price', 'createdAt', 'new', 'rating', 'views'])
  sortBy?: 'city' | 'price' | 'createdAt' | 'new' | 'rating' | 'views' =
    'createdAt';

  @ApiPropertyOptional({
    description:
      'Sort order: asc or desc. For price: asc = low to high, desc = high to low.',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
