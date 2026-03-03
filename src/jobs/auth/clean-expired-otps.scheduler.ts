import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CleanExpiredOtpsScheduler {
  private readonly logger = new Logger(CleanExpiredOtpsScheduler.name);

  constructor(
    @InjectQueue('auth') private readonly authQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleCleanExpiredOtps(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv !== 'production') {
      return;
    }
    this.logger.log('Scheduling clean expired OTPs job');
    try {
      await this.authQueue.add('clean-expired-otps', {
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error(
        'Failed to schedule clean expired OTPs job',
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
