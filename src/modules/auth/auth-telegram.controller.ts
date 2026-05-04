import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramLinkContactDto } from './dto/telegram-link-contact.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TelegramBotGuard } from './guards/telegram-bot.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApiPublicErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';

@ApiTags('Telegram Authentication')
@Controller('auth/telegram')
export class AuthTelegramController {
  constructor(private readonly authService: AuthService) {}

  @Post('link-contact')
  @Public()
  @UseGuards(TelegramBotGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Link Telegram contact and authenticate',
    description:
      'Receives a verified phone number from Telegram contact sharing and links it to a user account. If the user does not exist, a new account is created. Returns JWT tokens.',
  })
  @ApiBody({ type: TelegramLinkContactDto })
  @ApiPublicErrorResponses()
  @ApiResponse({
    status: 200,
    description: 'Telegram contact linked successfully. Tokens returned.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid bot secret',
    type: ApiErrorResponseDto,
  })
  async linkContact(
    @Body() dto: TelegramLinkContactDto,
  ): Promise<AuthResponseDto> {
    return this.authService.linkTelegramContact(dto);
  }
}
