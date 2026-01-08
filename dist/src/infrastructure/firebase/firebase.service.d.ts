import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFirebaseService } from './firebase-service.interface';
export declare class FirebaseService implements IFirebaseService, OnModuleInit {
    private readonly configService;
    private readonly logger;
    private app;
    private readonly circuitBreaker;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    sendNotification(token: string, title: string, body: string, data?: Record<string, string>): Promise<boolean>;
    sendNotificationToMultiple(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<{
        success: number;
        failure: number;
    }>;
    validateToken(token: string): boolean;
}
