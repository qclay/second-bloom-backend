import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchMessagesQueryDto {
  @ApiPropertyOptional({
    description:
      'Search query (message content). Omit or empty returns no results.',
    example: 'hello',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Max results',
    example: 20,
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 20;
}
