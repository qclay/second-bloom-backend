import {
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductAuctionOptionDto {
  @ApiPropertyOptional({
    description: 'Starting price for the auction. Defaults to product price.',
    example: 100000,
    minimum: 0.01,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  @IsOptional()
  startPrice?: number;

  @ApiPropertyOptional({
    description: 'Auction end time (ISO 8601).',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Auction duration in hours (1–168).',
    example: 24,
    minimum: 1,
    maximum: 168,
    default: 2,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(168)
  @IsOptional()
  durationHours?: number = 2;

  @ApiPropertyOptional({
    description: 'Auto-extend auction when bid placed near end time.',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  autoExtend?: boolean = true;

  @ApiPropertyOptional({
    description: 'Minutes before end time to trigger auto-extend.',
    example: 5,
    minimum: 1,
    maximum: 60,
    default: 5,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(60)
  @IsOptional()
  extendMinutes?: number = 5;
}
