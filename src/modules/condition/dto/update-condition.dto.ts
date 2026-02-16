import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TranslationDto } from '../../../common/dto/translation.dto';

export class UpdateConditionDto {
  @ApiPropertyOptional({
    description: 'Name in one or more languages. Slug regenerated.',
    example: { en: 'Like New', ru: 'Как новый' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslationDto)
  name?: TranslationDto;
}
