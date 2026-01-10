import { Module, Global } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseTimeInterceptor } from './interceptors/response-time.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { SentryService } from './services/sentry.service';
import { CacheService } from './services/cache.service';
import { RedisModule } from '../redis/redis.module';
import { LoggerModule } from './logger/logger.module';
import { MetricsModule } from '../metrics/metrics.module';
import { ConfigModule } from '../config/config.module';

@Global()
@Module({
  imports: [RedisModule, LoggerModule, MetricsModule, ConfigModule],
  providers: [
    SentryService,
    CacheService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [SentryService, CacheService],
})
export class CommonModule {}
