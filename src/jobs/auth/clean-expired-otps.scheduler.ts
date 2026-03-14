import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { AbstractCronJob } from '../common/abstract-cron-job';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class CleanExpiredOtpsScheduler extends AbstractCronJob {
  protected readonly logger = new Logger(CleanExpiredOtpsScheduler.name);
  protected readonly jobName = 'clean-expired-otps';
  protected readonly configKey = 'otps';

  constructor(
    @InjectQueue('auth') private readonly authQueue: Queue,
    configService: ConfigService,
    metricsService: MetricsService,
  ) {
    super(configService, metricsService);
  }

  @Cron('0 * * * *', { name: 'clean-expired-otps' }) // Fallback hourly
  async scheduleCleanExpiredOtps(): Promise<void> {
    await this.executeJob(async () => {
      await this.authQueue.add('clean-expired-otps', {
        timestamp: Date.now(),
        batchSize: this.getBatchSize(),
      });
    });
  }
}
