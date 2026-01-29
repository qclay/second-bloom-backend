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
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Local development')
    .setDescription(
      `REST API for the Second Bloom flower marketplace.

## Base URL
All endpoints (except \`/health\`) are prefixed with **\`/api/v1\`**.  
Example: \`GET /api/v1/products\`, \`POST /api/v1/auth/otp\`.

## Authentication
- **Public endpoints** (e.g. \`POST /auth/otp\`, \`POST /auth/verify\`, \`GET /products\`) do not require a token.
- **Protected endpoints** require a JWT in the header: \`Authorization: Bearer <access_token>\`.
- Obtain tokens via \`POST /auth/otp\` → \`POST /auth/verify\` (or \`POST /auth/refresh\` to refresh).

## Frontend integration
- Use **\`POST /auth/otp\`** with phone (e.g. \`+998901234567\`) then **\`POST /auth/verify\`** with \`phone\` + \`code\` to get \`accessToken\` and \`refreshToken\`.
- Store tokens and send \`Authorization: Bearer <accessToken>\` on every protected request.
- On 401, call **\`POST /auth/refresh\`** with \`refreshToken\` to get a new token pair.
- **Product detail page**: \`GET /products/:id\` returns product with \`activeAuction\` (id, endTime, status, currentPrice, totalBids) when the product has an active auction. Use \`GET /bids/auction/:auctionId\` for the bids list.
- **Create product with optional auction**: \`POST /products\` with \`createAuction: true\` and \`auction: { startPrice, endTime, ... }\` to create product and auction in one call.
- Paginated list responses include \`data\` and \`meta.pagination\` (page, limit, total, totalPages).`,
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('Authentication', 'Login, OTP, refresh token, logout')
    .addTag('Users', 'Profile, FCM, phone change')
    .addTag('Products', 'List, create, update, search products (bouquets)')
    .addTag('Categories', 'Product categories and tree')
    .addTag('Auctions', 'Auction list, detail, participants, leaderboard')
    .addTag('Bids', 'Place bid, list bids by auction/user')
    .addTag('Orders', 'Create and manage orders')
    .addTag('Payments', 'Payment creation and webhooks')
    .addTag('Chat', 'Conversations and messages')
    .addTag('Notifications', 'Push and in-app notifications')
    .addTag('Reviews', 'Product and user reviews')
    .addTag('Seller', 'Seller dashboard and stats')
    .addTag('File', 'Upload and manage files')
    .addTag('Settings', 'App and publication settings')
    .addTag('Health', 'Health check')
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
