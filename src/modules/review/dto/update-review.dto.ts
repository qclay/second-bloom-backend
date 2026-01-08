import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReviewDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isReported?: boolean;

  @IsString()
  @IsOptional()
  reportReason?: string;
}
