import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { WinstonLogger } from 'nest-winston';
import { SentryService } from '../services/sentry.service';
import { ConfigService } from '@nestjs/config';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    private readonly sentry;
    private readonly configService;
    constructor(logger: WinstonLogger, sentry: SentryService, configService: ConfigService);
    catch(exception: unknown, host: ArgumentsHost): void;
    private handlePrismaError;
    private getPrismaErrorMessage;
    private getDocumentationUrl;
    private getRetryInfo;
}
