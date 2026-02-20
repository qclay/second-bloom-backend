import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  Min,
  ArrayMaxSize,
  IsUUID,
} from 'class-validator';
import { ProductType, ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  tags?: string[];

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsString()
  @IsOptional()
  conditionId?: string;

  @IsString()
  @IsOptional()
  sizeId?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsUUID()
  @IsOptional()
  regionId?: string;

  @IsUUID()
  @IsOptional()
  cityId?: string;

  @IsUUID()
  @IsOptional()
  districtId?: string;

  @ApiPropertyOptional({
    description:
      'File UUIDs for product images (from GET /files or upload). Replaces current images. Include existing image IDs to keep them; order is preserved. All IDs are validated. Max 10. Omit to leave images unchanged.',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    maxItems: 10,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  imageIds?: string[];
}
