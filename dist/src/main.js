"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const class_validator_1 = require("class-validator");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: process.env.NODE_ENV === 'production'
            ? ['error', 'warn', 'log']
            : ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, compression_1.default)());
    app.use((req, res, next) => {
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
        req.on('data', (chunk) => {
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
    const shutdownGracefully = async (signal) => {
        logger.log(`Received ${signal}, shutting down gracefully...`);
        try {
            await app.close();
            logger.log('Application closed successfully');
            process.exit(0);
        }
        catch (error) {
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
    (0, class_validator_1.useContainer)(app.select(app_module_1.AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new common_1.ValidationPipe({
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
    }));
    const corsOrigin = configService.get('CORS_ORIGIN', '*');
    app.enableCors({
        origin: corsOrigin === '*'
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
    const apiVersion = configService.get('API_VERSION', 'v1');
    app.setGlobalPrefix(`api/${apiVersion}`);
    app.use((req, res, next) => {
        req.setTimeout(30000, () => {
            res.status(408).json({
                success: false,
                error: {
                    code: 'REQUEST_TIMEOUT',
                    message: 'Request timeout - the server did not receive a complete request within the time allowed',
                },
                statusCode: 408,
                timestamp: new Date().toISOString(),
                path: req.url,
            });
        });
        next();
    });
    const port = configService.get('PORT', 3000);
    const swaggerEnabled = configService.get('SWAGGER_ENABLED', 'true');
    const nodeEnv = configService.get('NODE_ENV', 'development');
    if (swaggerEnabled === 'true' && nodeEnv !== 'production') {
        const { DocumentBuilder, SwaggerModule } = await Promise.resolve().then(() => __importStar(require('@nestjs/swagger')));
        const { ApiSuccessResponseDto } = await Promise.resolve().then(() => __importStar(require('./common/dto/api-success-response.dto')));
        const { ApiErrorResponseDto, ApiErrorObjectDto } = await Promise.resolve().then(() => __importStar(require('./common/dto/api-error-response.dto')));
        const { ApiErrorDetailDto } = await Promise.resolve().then(() => __importStar(require('./common/dto/api-error-detail.dto')));
        const { PaginationMetaDto } = await Promise.resolve().then(() => __importStar(require('./common/dto/pagination-meta.dto')));
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
        const swaggerPath = configService.get('SWAGGER_PATH', 'api/docs');
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
//# sourceMappingURL=main.js.map