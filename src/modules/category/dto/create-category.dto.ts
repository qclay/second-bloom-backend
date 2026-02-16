import {
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TranslationDto,
  TranslationDescriptionDto,
} from '../../../common/dto/translation.dto';

export class CreateCategoryDto {
  @ValidateNested()
  @Type(() => TranslationDto)
  name!: TranslationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslationDescriptionDto)
  description?: TranslationDescriptionDto;

  @IsString()
  @IsOptional()
  imageId?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsOptional()
  order?: number;
}
