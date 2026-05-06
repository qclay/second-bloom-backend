import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by parent category ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Filter products by city ID' })
  @IsOptional()
  @IsString()
  cityId?: string;

  @ApiPropertyOptional({ description: 'Filter products by charity status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isCharity?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeChildren?: boolean = false;

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
}
