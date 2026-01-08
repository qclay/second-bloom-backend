import { PartialType } from '@nestjs/mapped-types';
import { CreateAuctionDto } from './create-auction.dto';
import {
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuctionStatus } from '@prisma/client';

export class UpdateAuctionDto extends PartialType(CreateAuctionDto) {
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  startPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  bidIncrement?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  minBidAmount?: number;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(168)
  @IsOptional()
  durationHours?: number;

  @IsBoolean()
  @IsOptional()
  autoExtend?: boolean;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(60)
  @IsOptional()
  extendMinutes?: number;

  @IsEnum(AuctionStatus)
  @IsOptional()
  status?: AuctionStatus;
}
