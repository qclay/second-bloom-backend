import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly slowQueryThreshold: number;
  private slowQueryCount = 0;
  private totalQueryCount = 0;
  private totalQueryTime = 0;
  private pool: Pool | null = null;

  constructor() {
    const slowQueryThreshold =
      parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '1000', 10) || 1000;

    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is required. Please set it in your .env file.',
      );
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'info' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ]
          : [
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ],
      errorFormat: 'pretty' as const,
    });

    this.pool = pool;
    this.slowQueryThreshold = slowQueryThreshold;
    this.setupQueryMonitoring();
  }

  private setupQueryMonitoring(): void {
    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      this.totalQueryCount++;
      this.totalQueryTime += e.duration;

      if (e.duration > this.slowQueryThreshold) {
        this.slowQueryCount++;
        this.logger.warn('Slow query detected', {
          query: e.query,
          duration: `${e.duration}ms`,
          params: e.params,
          target: e.target,
        });
      }

      if (process.env.NODE_ENV === 'development') {
        this.logger.debug('Database query', {
          query: e.query.substring(0, 200),
          duration: `${e.duration}ms`,
        });
      }
    });
  }

  getQueryStats(): {
    totalQueries: number;
    slowQueries: number;
    averageQueryTime: number;
    slowQueryPercentage: number;
  } {
    return {
      totalQueries: this.totalQueryCount,
      slowQueries: this.slowQueryCount,
      averageQueryTime:
        this.totalQueryCount > 0
          ? Math.round(this.totalQueryTime / this.totalQueryCount)
          : 0,
      slowQueryPercentage:
        this.totalQueryCount > 0
          ? Math.round((this.slowQueryCount / this.totalQueryCount) * 100)
          : 0,
    };
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      if (this.pool) {
        await this.pool.end();
      }
      this.logger.log('Database connection closed');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}
