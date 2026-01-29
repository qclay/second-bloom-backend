import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSizeDto {
  @ApiPropertyOptional({
    description: 'New name. Slug regenerated.',
    example: 'Medium',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;
}
