import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  Min,
  ArrayMaxSize,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ProductType, ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductAuctionOptionDto } from './product-auction-option.dto';
import {
  TranslationDto,
  TranslationDescriptionDto,
} from '../../../common/dto/translation.dto';

export class CreateProductDto {
  @ApiPropertyOptional({
    description: 'Product title in one or more languages (en, ru, uz).',
    example: {
      en: 'Fresh Red Roses Bouquet',
      ru: 'Букет свежих красных роз',
      uz: 'Yangi qizil atirgul buketi',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslationDto)
  title?: TranslationDto;

  @ApiProperty({
    description: 'Product description in one or more languages.',
    example: {
      en: 'Beautiful fresh red roses',
      ru: 'Красивые свежие красные розы',
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslationDescriptionDto)
  description?: TranslationDescriptionDto;

  @ApiProperty({
    description:
      'Price. Required for fixed price; optional when createAuction true.',
    example: 150000,
    minimum: 0,
    required: false,
  })
  @ValidateIf((o) => o.createAuction !== true)
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Currency code. Default UZS.',
    example: 'UZS',
    maxLength: 3,
    default: 'UZS',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string = 'UZS';

  @ApiProperty({
    description: 'Category ID (from GET /categories).',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'Tags for filtering/search',
    example: ['roses', 'bouquet'],
    maxItems: 10,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Product type',
    enum: ProductType,
    default: ProductType.FRESH,
  })
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType = ProductType.FRESH;

  @ApiProperty({
    description: 'Condition ID (from GET /conditions).',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  conditionId!: string;

  @ApiProperty({
    description: 'Size ID (from GET /sizes).',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  sizeId!: string;

  @ApiPropertyOptional({
    description: 'Quantity',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  quantity?: number = 1;

  @ApiPropertyOptional({
    description: 'Product status',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Feature on homepage',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({
    description: 'Region ID (from GET /locations/regions).',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  regionId?: string;

  @ApiPropertyOptional({
    description: 'City ID (from GET /locations/cities).',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional({
    description: 'District ID (from GET /locations/districts).',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID()
  @IsOptional()
  districtId?: string;

  @ApiPropertyOptional({
    description: 'Uploaded file IDs for product images (order preserved)',
    example: ['file-uuid-1', 'file-uuid-2'],
    maxItems: 10,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  imageIds?: string[];

  @ApiProperty({
    description: 'Whether to create an auction for this product.',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  createAuction?: boolean = false;

  @ApiPropertyOptional({
    description:
      'Auction options. Used when createAuction is true. Field names match auction domain (startPrice, endTime, durationHours, autoExtend, extendMinutes).',
    type: ProductAuctionOptionDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductAuctionOptionDto)
  auction?: ProductAuctionOptionDto;
}
