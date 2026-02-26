import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddPublicationCreditsDto {
  @ApiPropertyOptional({
    description: 'Number of publication credits to add. Default 5, max 20.',
    minimum: 1,
    maximum: 20,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  quantity?: number = 5;
}
