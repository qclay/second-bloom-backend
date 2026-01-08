import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { redisConfig } from './redis.config';
import { awsConfig } from './aws.config';
import { smsConfig } from './sms.config';
import { paymentConfig } from './payment.config';
import { sentryConfig } from './sentry.config';
import { firebaseConfig } from './firebase.config';
import telegramConfig from './telegram.config';
import { validateEnv } from './env.validation';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        redisConfig,
        awsConfig,
        smsConfig,
        paymentConfig,
        sentryConfig,
        firebaseConfig,
        telegramConfig,
      ],
      validate: validateEnv,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
