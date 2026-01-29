import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConditionDto {
  @ApiPropertyOptional({
    description: 'New name. Slug regenerated.',
    example: 'Like New',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;
}
