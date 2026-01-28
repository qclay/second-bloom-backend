import {
  IsString,
  IsNotEmpty,
  IsOptional,
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
import { ProductType, ProductCondition, ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductAuctionOptionDto } from './product-auction-option.dto';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    example: 'Fresh Red Roses Bouquet',
    maxLength: 255,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Beautiful fresh red roses arranged in an elegant bouquet',
    maxLength: 5000,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    description:
      'Product price in UZS. Required for fixed price; optional for auction (use auctionStartPrice instead).',
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
    description: 'Currency code',
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
    description: 'Category ID',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  tags?: string[];

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType = ProductType.FRESH;

  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  quantity?: number = 1;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  region?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

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
