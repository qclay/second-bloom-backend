import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AbstractCronJob } from '../common/abstract-cron-job';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class EndExpiredAuctionsScheduler extends AbstractCronJob {
  protected readonly logger = new Logger(EndExpiredAuctionsScheduler.name);
  protected readonly jobName = 'end-expired-auctions';
  protected readonly configKey = 'auctions';

  constructor(
    @InjectQueue('auction') private readonly auctionQueue: Queue,
    configService: ConfigService,
    metricsService: MetricsService,
  ) {
    super(configService, metricsService);
  }

  @Cron('*/30 * * * * *') // Fallback, will be overridden by the system if we had dynamic cron
  async scheduleEndExpiredAuctions(): Promise<void> {
    await this.executeJob(async () => {
      await this.auctionQueue.add('end-expired', {
        timestamp: Date.now(),
        batchSize: this.getBatchSize(),
      });
    });
  }
}
