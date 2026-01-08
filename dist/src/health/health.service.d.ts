import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AwsService } from '../infrastructure/aws/aws.service';
import { SmsService } from '../infrastructure/sms/sms.service';
export interface HealthStatus {
    status: 'ok' | 'error';
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
    services: {
        database: {
            status: 'ok' | 'error';
            responseTime?: number;
            message?: string;
            connectionPool?: {
                activeConnections: number;
                idleConnections: number;
                totalConnections: number;
                maxConnections: number;
                utilization: number;
            };
        };
        redis: {
            status: 'ok' | 'error';
            responseTime?: number;
            message?: string;
        };
        aws?: {
            status: 'ok' | 'error';
            message?: string;
        };
        sms?: {
            status: 'ok' | 'error';
            message?: string;
        };
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    disk?: {
        free: number;
        total: number;
        percentage: number;
    };
}
export declare class HealthService {
    private readonly prisma;
    private readonly redis;
    private readonly configService;
    private readonly awsService?;
    private readonly smsService?;
    private readonly logger;
    private readonly startTime;
    constructor(prisma: PrismaService, redis: RedisService, configService: ConfigService, awsService?: AwsService | undefined, smsService?: SmsService | undefined);
    checkHealth(): Promise<HealthStatus>;
    private checkDatabase;
    private checkRedis;
    private checkAws;
    private checkSms;
    private checkDiskSpace;
}
