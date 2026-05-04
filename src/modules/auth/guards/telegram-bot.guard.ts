import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramBotGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const botSecret = request.body?.botSecret;
    const expectedSecret = this.configService.get<string>('telegram.botAuthSecret');

    if (!expectedSecret) {
      throw new Error('TELEGRAM_BOT_AUTH_SECRET is not configured');
    }

    if (!botSecret || botSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid bot secret');
    }

    return true;
  }
}
