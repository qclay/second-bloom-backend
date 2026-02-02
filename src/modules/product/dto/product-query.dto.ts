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
      'Filter by sale phase (seller dashboard): all, in_auction, sold, in_delivery. Use with sellerId for "All bouquets", "On auction", "Sold", "In delivery".',
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
    description: 'Filter by region.',
    example: 'Tashkent',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Filter by city.' })
  @IsOptional()
  @IsString()
  city?: string;

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
    description: 'Sort field: createdAt, price, views.',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order: asc or desc.',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
