import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TranslationService } from './translation.service';
import { TranslateRequestDto } from './dto/translate-request.dto';
import { TranslateResponseDto } from './dto/translate-response.dto';
import { ApiAuthErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Translation')
@ApiBearerAuth()
@Controller('translate')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Translate text to target languages',
    description:
      'Uses OpenAI GPT to translate the given text from sourceLocale into each targetLocale. Returns a map of locale -> translated string. Requires OPENAI_API_KEY to be set. Authenticated users only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Translations per requested locale',
    type: TranslateResponseDto,
  })
  @ApiAuthErrorResponses()
  async translate(
    @Body() dto: TranslateRequestDto,
  ): Promise<TranslateResponseDto> {
    const translations = await this.translationService.translate(
      dto.text,
      dto.sourceLocale,
      dto.targetLocales,
    );
    return { translations };
  }
}
