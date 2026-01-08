import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerificationCodeRepository } from './repositories/verification-code.repository';
import { OtpService } from './services/otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  imports: [
    PrismaModule,
    InfrastructureModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      // @ts-expect-error - JWT library has strict types for expiresIn
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret');
        const expiresIn = configService.get<string>('jwt.expiresIn', '15m');
        if (!secret) {
          throw new Error('JWT secret is not configured');
        }
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, VerificationCodeRepository, OtpService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
