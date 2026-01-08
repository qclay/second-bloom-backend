import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewQueryDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  reviewerId?: string;

  @IsString()
  @IsOptional()
  revieweeId?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  @IsOptional()
  minRating?: number;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  @IsOptional()
  maxRating?: number;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isReported?: boolean;

  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount' = 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
