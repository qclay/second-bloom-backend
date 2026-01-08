import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuctionDto {
  @ApiProperty({
    description: 'Product ID to create auction for',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Starting price for the auction',
    example: 100000,
    minimum: 0.01,
    required: true,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  startPrice!: number;

  @ApiProperty({
    description: 'Minimum bid increment amount',
    example: 1000,
    minimum: 0,
    default: 1000,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  bidIncrement?: number = 1000;

  @ApiProperty({
    description: 'Minimum bid amount',
    example: 5000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  minBidAmount?: number;

  @ApiProperty({
    description: 'Auction end time (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    description: 'Auction duration in hours (1-168)',
    example: 24,
    minimum: 1,
    maximum: 168,
    default: 2,
    required: false,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(168)
  @IsOptional()
  durationHours?: number = 2;

  @ApiProperty({
    description: 'Auto-extend auction if bid placed near end time',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  autoExtend?: boolean = true;

  @ApiProperty({
    description: 'Minutes before end time to trigger auto-extend',
    example: 5,
    minimum: 1,
    maximum: 60,
    default: 5,
    required: false,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(60)
  @IsOptional()
  extendMinutes?: number = 5;
}
