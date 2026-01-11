import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { ApiSuccessResponseDto } from '../common/dto/api-success-response.dto';
import {
  ApiErrorResponseDto,
  ApiErrorObjectDto,
} from '../common/dto/api-error-response.dto';
import { ApiErrorDetailDto } from '../common/dto/api-error-detail.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';

export const setupSwagger = (app: INestApplication): void => {
  const configService = app.get(ConfigService);
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'true');

  if (swaggerEnabled !== 'true') {
    return;
  }

  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
  const swaggerUsername = configService.get<string>(
    'SWAGGER_USERNAME',
    'admin',
  );
  const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD', '');

  if (swaggerPassword) {
    app.use(
      [`/${swaggerPath}`, `/${swaggerPath}-json`],
      basicAuth({
        challenge: true,
        realm: 'Swagger Documentation',
        users: {
          [swaggerUsername]: swaggerPassword,
        },
        unauthorizedResponse: (req: Request) => {
          return {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message:
                'Authentication required to access Swagger documentation',
            },
            statusCode: 401,
            timestamp: new Date().toISOString(),
            path: req.url,
          };
        },
      }),
    );
  }

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
};
