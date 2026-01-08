import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BidQueryDto {
  @IsOptional()
  @IsString()
  auctionId?: string;

  @IsOptional()
  @IsString()
  bidderId?: string;

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
