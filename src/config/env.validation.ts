import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
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
  SPACES_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  SPACES_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  SPACES_REGION?: string;

  @IsString()
  @IsOptional()
  SPACES_BUCKET?: string;

  @IsString()
  @IsOptional()
  SPACES_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  SPACES_CDN_URL?: string;

  @IsString()
  @IsOptional()
  ESKIZ_EMAIL?: string;

  @IsString()
  @IsOptional()
  ESKIZ_PASSWORD?: string;

  @IsUrl()
  @IsOptional()
  ESKIZ_API_URL?: string;

  @IsString()
  @IsOptional()
  ESKIZ_SENDER_ID?: string;

  @IsNumber()
  @IsOptional()
  PORT?: number;

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

  @IsString()
  @IsOptional()
  SWAGGER_USERNAME?: string;

  @IsString()
  @IsOptional()
  SWAGGER_PASSWORD?: string;

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

  @IsOptional()
  @ValidateIf(
    (o) =>
      o.FIREBASE_DATABASE_URL !== undefined && o.FIREBASE_DATABASE_URL !== '',
  )
  @IsUrl()
  FIREBASE_DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  TELEGRAM_BOT_TOKEN?: string;

  @IsString()
  @IsOptional()
  TELEGRAM_CHAT_ID?: string;

  @IsString()
  @IsOptional()
  PAYMENT_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  PAYMENT_API_URL?: string;
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
