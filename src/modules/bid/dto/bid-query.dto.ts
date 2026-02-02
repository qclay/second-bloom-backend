import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export const BID_VIEW_VALUES = ['all', 'new', 'top', 'rejected'] as const;
export type BidView = (typeof BID_VIEW_VALUES)[number];

export class BidQueryDto {
  @IsOptional()
  @IsString()
  auctionId?: string;

  @IsOptional()
  @IsString()
  bidderId?: string;

  @IsOptional()
  @IsIn(BID_VIEW_VALUES)
  view?: BidView;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isWinning?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRetracted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
