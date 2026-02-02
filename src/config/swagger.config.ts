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
  const config = app.get(ConfigService);
  if (config.get<string>('SWAGGER_ENABLED', 'true') !== 'true') return;

  const path = config.get<string>('SWAGGER_PATH', 'api/docs');
  const password = config.get<string>('SWAGGER_PASSWORD', '');

  if (password) {
    const user = config.get<string>('SWAGGER_USERNAME', 'admin');
    app.use(
      [`/${path}`, `/${path}-json`, `/${path}/openapi.json`],
      basicAuth({
        challenge: true,
        realm: 'Swagger',
        users: { [user]: password },
        unauthorizedResponse: {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          statusCode: 401,
        },
      }),
    );
  }

  const apiVersion = config.get<string>('API_VERSION', 'v1');
  const globalPrefix = `api/${apiVersion}`;

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Second Bloom API')
      .setVersion('1.0.0')
      .setDescription('Second Bloom API Documentation')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .build(),
    {
      extraModels: [
        ApiSuccessResponseDto,
        ApiErrorResponseDto,
        ApiErrorObjectDto,
        ApiErrorDetailDto,
        PaginationMetaDto,
      ],
    },
  );

  if (document.paths) {
    const prefixedHealth = `/${globalPrefix}/health`;
    const paths = document.paths as Record<
      string,
      import('@nestjs/swagger').OpenAPIObject['paths'] extends Record<
        string,
        infer V
      >
        ? V
        : never
    >;
    const healthPaths: Record<string, (typeof paths)[string]> = {};
    for (const path of Object.keys(paths)) {
      if (path === prefixedHealth || path.startsWith(prefixedHealth + '/')) {
        const suffix = path.slice(prefixedHealth.length) || '';
        healthPaths['/health' + suffix] = paths[path];
      }
    }
    for (const [p, spec] of Object.entries(healthPaths)) {
      document.paths[p] = spec;
    }
    for (const path of Object.keys(paths)) {
      if (path.startsWith(prefixedHealth)) {
        delete document.paths[path];
      }
    }
  }

  const downloadPath = `/${path}/openapi.json`;
  app.getHttpAdapter().get(downloadPath, (_req: unknown, res: unknown) => {
    const response = res as {
      setHeader: (name: string, value: string) => void;
      json: (body: object) => void;
    };
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="openapi.json"',
    );
    response.setHeader('Content-Type', 'application/json');
    response.json(document);
  });

  const downloadJs =
    'data:text/javascript;base64,' +
    Buffer.from(
      `(function(){var a=document.createElement("a");a.href="${downloadPath}";a.textContent="Download OpenAPI JSON";a.download="openapi.json";a.style.cssText="color:#4990e2;font-weight:bold;margin-bottom:15px;display:inline-block";var c=document.querySelector(".information-container");if(c)c.insertBefore(a,c.firstChild);})();`,
    ).toString('base64');

  SwaggerModule.setup(path, app, document, {
    customSiteTitle: 'Second Bloom API',
    customCss: '.swagger-ui .topbar { display: none }',
    customJs: downloadJs,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  });
};
