import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  REFRESH_TOKEN_SECRET?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID?: string;

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  AWS_REGION?: string;

  @IsString()
  @IsOptional()
  AWS_S3_BUCKET?: string;

  @IsString()
  @IsOptional()
  AWS_S3_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  SMS_API_KEY?: string;

  @IsUrl()
  @IsOptional()
  SMS_API_URL?: string;

  @IsString()
  @IsOptional()
  PAYME_MERCHANT_ID?: string;

  @IsString()
  @IsOptional()
  PAYME_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  CLICK_MERCHANT_ID?: string;

  @IsString()
  @IsOptional()
  CLICK_SERVICE_ID?: string;

  @IsString()
  @IsOptional()
  CLICK_SECRET_KEY?: string;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  @IsString()
  @IsOptional()
  SENTRY_ENABLED?: string;

  @IsString()
  @IsOptional()
  API_VERSION?: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  @IsString()
  @IsOptional()
  SWAGGER_ENABLED?: string;

  @IsString()
  @IsOptional()
  SWAGGER_PATH?: string;

  @IsNumber()
  @IsOptional()
  SLOW_QUERY_THRESHOLD_MS?: number;

  @IsString()
  @IsOptional()
  FIREBASE_PROJECT_ID?: string;

  @IsString()
  @IsOptional()
  FIREBASE_PRIVATE_KEY?: string;

  @IsString()
  @IsOptional()
  FIREBASE_CLIENT_EMAIL?: string;

  @IsUrl()
  @IsOptional()
  FIREBASE_DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  TELEGRAM_BOT_TOKEN?: string;

  @IsString()
  @IsOptional()
  TELEGRAM_CHAT_ID?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true, // Allow optional properties
    skipNullProperties: true,
    skipUndefinedProperties: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  return validatedConfig;
}
