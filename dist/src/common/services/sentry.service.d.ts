import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
export declare class SentryService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    captureException(exception: unknown, context?: {
        requestId?: string;
        userId?: string;
        extra?: Record<string, unknown>;
    }): string;
    captureMessage(message: string, level?: Sentry.SeverityLevel, context?: {
        requestId?: string;
        userId?: string;
        extra?: Record<string, unknown>;
    }): string;
}
