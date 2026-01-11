import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
    private readonly awsService?: AwsService,
    private readonly smsService?: SmsService,
  ) {}

  async checkHealth(): Promise<HealthStatus> {
    const [databaseCheck, redisCheck, awsCheck, smsCheck, diskInfo] =
      await Promise.all([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkAws(),
        this.checkSms(),
        this.checkDiskSpace(),
      ]);

    const memoryUsage = process.memoryUsage();

    const overallStatus =
      databaseCheck.status === 'ok' && redisCheck.status === 'ok'
        ? 'ok'
        : 'error';

    const services: HealthStatus['services'] = {
      database: databaseCheck,
      redis: redisCheck,
    };

    if (awsCheck) {
      services.aws = awsCheck;
    }

    if (smsCheck) {
      services.sms = smsCheck;
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      services,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        percentage: Math.round(
          (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        ),
      },
      disk: diskInfo,
    };
  }

  private async checkDatabase(): Promise<{
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
  }> {
    const startTime = Date.now();
    try {
      await this.prisma.healthCheck();
      const responseTime = Date.now() - startTime;

      let connectionPool;
      try {
        const poolStatsResult = await this.prisma.$queryRaw<
          Array<{
            active_connections: bigint;
            idle_connections: bigint;
            total_connections: bigint;
            max_connections: bigint;
          }>
        >`
          SELECT 
            COUNT(*) FILTER (WHERE state = 'active') as active_connections,
            COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
            COUNT(*) as total_connections,
            (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
          FROM pg_stat_activity
          WHERE datname = current_database()
        `;

        if (poolStatsResult && poolStatsResult.length > 0) {
          const stats = poolStatsResult[0];
          const activeConnections = Number(stats.active_connections);
          const idleConnections = Number(stats.idle_connections);
          const totalConnections = Number(stats.total_connections);
          const maxConnections = Number(stats.max_connections);
          const utilization =
            maxConnections > 0
              ? Math.round((totalConnections / maxConnections) * 100)
              : 0;

          if (utilization > 80) {
            this.logger.warn(
              `Database connection pool utilization is high: ${utilization}%`,
            );
          }

          connectionPool = {
            activeConnections,
            idleConnections,
            totalConnections,
            maxConnections,
            utilization,
          };
        }
      } catch (error) {
        this.logger.warn(
          'Failed to fetch connection pool stats',
          error instanceof Error ? error.message : 'Unknown error',
        );
      }

      return {
        status: 'ok',
        responseTime,
        message: 'Database connection healthy',
        connectionPool,
      };
    } catch (error) {
      return {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  }

  private async checkRedis(): Promise<{
    status: 'ok' | 'error';
    responseTime?: number;
    message?: string;
  }> {
    const startTime = Date.now();
    try {
      const isHealthy = await this.redis.healthCheck();
      const responseTime = Date.now() - startTime;
      return {
        status: isHealthy ? 'ok' : 'error',
        responseTime,
        message: isHealthy
          ? 'Redis connection healthy'
          : 'Redis connection failed',
      };
    } catch (error) {
      return {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Redis connection failed',
      };
    }
  }

  private checkAws(): Promise<
    | {
        status: 'ok' | 'error';
        message?: string;
      }
    | undefined
  > {
    if (!this.awsService) {
      return Promise.resolve(undefined);
    }

    try {
      const bucketName = this.configService.get<string>('aws.bucket');
      if (!bucketName) {
        return Promise.resolve({
          status: 'error',
          message: 'AWS S3 bucket not configured',
        });
      }
      return Promise.resolve({
        status: 'ok',
        message: 'AWS S3 configured',
      });
    } catch (error) {
      return Promise.resolve({
        status: 'error',
        message: error instanceof Error ? error.message : 'AWS check failed',
      });
    }
  }

  private checkSms(): Promise<
    | {
        status: 'ok' | 'error';
        message?: string;
      }
    | undefined
  > {
    if (!this.smsService) {
      return Promise.resolve(undefined);
    }

    try {
      const eskizEmail = this.configService.get<string>('sms.email');
      const eskizPassword = this.configService.get<string>('sms.password');
      if (!eskizEmail || !eskizPassword) {
        return Promise.resolve({
          status: 'error',
          message: 'Eskiz SMS service not configured',
        });
      }
      return Promise.resolve({
        status: 'ok',
        message: 'Eskiz SMS service configured',
      });
    } catch (error) {
      return Promise.resolve({
        status: 'error',
        message: error instanceof Error ? error.message : 'SMS check failed',
      });
    }
  }

  private async checkDiskSpace(): Promise<
    | {
        free: number;
        total: number;
        percentage: number;
      }
    | undefined
  > {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.statfs('/');
      const free = Math.round((stats.bavail * stats.bsize) / 1024 / 1024);
      const total = Math.round((stats.blocks * stats.bsize) / 1024 / 1024);
      const used = total - free;
      const percentage = Math.round((used / total) * 100);

      return {
        free,
        total,
        percentage,
      };
    } catch (error) {
      this.logger.warn('Failed to check disk space', error);
      return undefined;
    }
  }
}
