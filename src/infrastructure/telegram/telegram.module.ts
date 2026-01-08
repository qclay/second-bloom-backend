import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TelegramService } from './telegram.service';
import telegramConfig from '../../config/telegram.config';

@Module({
  imports: [
    ConfigModule.forFeature(telegramConfig),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
