import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerificationCodeRepository } from './repositories/verification-code.repository';
import { OtpService } from './services/otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { ConversationModule } from '../conversation/conversation.module';
import { AuthTelegramController } from './auth-telegram.controller';
import { TelegramBotGuard } from './guards/telegram-bot.guard';

@Module({
  imports: [
    PrismaModule,
    InfrastructureModule,
    ConversationModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('jwt.secret');
        const expiresIn = configService.get<string>('jwt.expiresIn', '15m');
        if (!secret) {
          throw new Error('JWT secret is not configured');
        }
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as StringValue,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, AuthTelegramController],
  providers: [
    AuthService,
    VerificationCodeRepository,
    OtpService,
    JwtStrategy,
    TelegramBotGuard,
  ],
  exports: [AuthService, JwtStrategy, OtpService],
})
export class AuthModule {}
