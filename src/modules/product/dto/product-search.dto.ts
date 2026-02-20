import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, ProductStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ProductSearchDto {
  @ApiProperty({
    description: 'Search term to find in title, slug, description, or tags',
    example: 'roses',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by category ID',
    example: 'category-id',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by multiple category IDs',
    example: ['category-id-1', 'category-id-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    description: 'Filter by seller ID',
    example: 'seller-id',
    required: false,
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiProperty({
    description: 'Filter by multiple seller IDs',
    example: ['seller-id-1', 'seller-id-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sellerIds?: string[];

  @ApiProperty({
    description: 'Filter featured products',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Filter by product type',
    enum: ProductType,
    example: 'FRESH',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiProperty({
    description: 'Filter by multiple product types',
    enum: ProductType,
    isArray: true,
    example: ['FRESH', 'DRIED'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ProductType, { each: true })
  types?: ProductType[];

  @ApiProperty({
    description: 'Filter by product status',
    enum: ProductStatus,
    example: 'ACTIVE',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({
    description: 'Filter by multiple product statuses',
    enum: ProductStatus,
    isArray: true,
    example: ['ACTIVE', 'DRAFT'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ProductStatus, { each: true })
  statuses?: ProductStatus[];

  @ApiProperty({
    description: 'Filter by region ID (from GET /locations/regions)',
    required: false,
  })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiProperty({
    description: 'Filter by multiple region IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regionIds?: string[];

  @ApiProperty({
    description: 'Filter by city ID (from GET /locations/cities)',
    required: false,
  })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiProperty({
    description: 'Filter by multiple city IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cityIds?: string[];

  @ApiProperty({
    description: 'Filter by district ID (from GET /locations/districts)',
    required: false,
  })
  @IsOptional()
  @IsString()
  districtId?: string;

  @ApiProperty({
    description: 'Filter by multiple district IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  districtIds?: string[];

  @ApiProperty({
    description: 'Filter by condition ID (from GET /conditions)',
    example: 'condition-uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  conditionId?: string;

  @ApiProperty({
    description: 'Filter by multiple condition IDs',
    example: ['condition-uuid-1', 'condition-uuid-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditionIds?: string[];

  @ApiProperty({
    description: 'Filter by size ID (from GET /sizes)',
    example: 'size-uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  sizeId?: string;

  @ApiProperty({
    description: 'Filter by multiple size IDs',
    example: ['size-uuid-1', 'size-uuid-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizeIds?: string[];

  @ApiProperty({
    description: 'Minimum price filter',
    example: 100000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price filter',
    example: 500000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description:
      'Filter by tags (products must have at least one of these tags)',
    example: ['roses', 'bouquet'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description:
      'Sort field: city, price (use sortOrder asc for low→high), createdAt, new (newest first), rating (seller rating), views, updatedAt.',
    example: 'price',
    enum: ['city', 'price', 'createdAt', 'new', 'rating', 'views', 'updatedAt'],
    default: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
