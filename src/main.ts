import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { useContainer } from 'class-validator';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(compression());

  app.use((req: Request, res: Response, next: NextFunction): void => {
    if (req.path.includes('/files/upload')) {
      return next();
    }

    const contentLengthHeader = req.headers['content-length'];
    const maxSize = 10 * 1024 * 1024;

    if (contentLengthHeader) {
      const contentLength = parseInt(contentLengthHeader, 10);
      if (contentLength > maxSize) {
        res.status(413).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Request entity too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
          },
          statusCode: 413,
          timestamp: new Date().toISOString(),
          path: req.url,
        });
        return;
      }
    }

    let receivedBytes = 0;

    req.on('data', (chunk: Buffer) => {
      receivedBytes += chunk.length;
      if (receivedBytes > maxSize) {
        res.status(413).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Request entity too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
          },
          statusCode: 413,
          timestamp: new Date().toISOString(),
          path: req.url,
        });
        req.destroy();
        return;
      }
    });

    next();
  });

  app.enableShutdownHooks();

  const shutdownGracefully = async (signal: string): Promise<void> => {
    logger.log(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      logger.log('Application closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => {
    void shutdownGracefully('SIGTERM');
  });
  process.on('SIGINT', () => {
    void shutdownGracefully('SIGINT');
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  app.enableCors({
    origin:
      corsOrigin === '*'
        ? true
        : corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Requested-With',
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
    ],
  });

  const apiVersion = configService.get<string>('API_VERSION', 'v1');
  app.setGlobalPrefix(`api/${apiVersion}`);

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(30000, () => {
      res.status(408).json({
        success: false,
        error: {
          code: 'REQUEST_TIMEOUT',
          message:
            'Request timeout - the server did not receive a complete request within the time allowed',
        },
        statusCode: 408,
        timestamp: new Date().toISOString(),
        path: req.url,
      });
    });
    next();
  });

  const port = configService.get<number>('PORT', 3000);
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'true');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  if (swaggerEnabled === 'true' && nodeEnv !== 'production') {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const { ApiSuccessResponseDto } =
      await import('./common/dto/api-success-response.dto');
    const { ApiErrorResponseDto, ApiErrorObjectDto } =
      await import('./common/dto/api-error-response.dto');
    const { ApiErrorDetailDto } =
      await import('./common/dto/api-error-detail.dto');
    const { PaginationMetaDto } =
      await import('./common/dto/pagination-meta.dto');

    const config = new DocumentBuilder()
      .setTitle('Second Bloom API')
      .setDescription('Flower Marketplace API Documentation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [
        ApiSuccessResponseDto,
        ApiErrorResponseDto,
        ApiErrorObjectDto,
        ApiErrorDetailDto,
        PaginationMetaDto,
      ],
    });

    const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Second Bloom API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    });
    logger.log(`📚 Swagger documentation available at /${swaggerPath}`);
  }
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`📦 Version: ${process.env.npm_package_version || '1.0.0'}`);
}

void bootstrap();
