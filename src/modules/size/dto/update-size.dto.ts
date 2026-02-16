import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TranslationDto } from '../../../common/dto/translation.dto';

export class UpdateSizeDto {
  @ApiPropertyOptional({
    description: 'Name in one or more languages. Slug regenerated.',
    example: { en: 'Medium', ru: 'Средний' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslationDto)
  name?: TranslationDto;
}
