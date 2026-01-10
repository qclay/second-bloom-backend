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
    description: 'Filter by region',
    example: 'Tashkent',
    required: false,
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({
    description: 'Filter by multiple regions',
    example: ['Tashkent', 'Samarkand'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiProperty({
    description: 'Filter by city',
    example: 'Tashkent',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Filter by multiple cities',
    example: ['Tashkent', 'Samarkand'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @ApiProperty({
    description: 'Filter by district',
    example: 'Yunusabad',
    required: false,
  })
  @IsOptional()
  @IsString()
  district?: string;

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
    description: 'Field to sort by',
    example: 'price',
    enum: ['price', 'views', 'createdAt', 'updatedAt'],
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
