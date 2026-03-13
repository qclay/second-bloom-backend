import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { AbstractCronJob } from '../common/abstract-cron-job';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class DeactivateOrderConversationsScheduler extends AbstractCronJob {
  protected readonly logger = new Logger(
    DeactivateOrderConversationsScheduler.name,
  );
  protected readonly jobName = 'deactivate-order-conversations';
  protected readonly configKey = 'conversations';

  constructor(
    @InjectQueue('conversation') private readonly conversationQueue: Queue,
    configService: ConfigService,
    metricsService: MetricsService,
  ) {
    super(configService, metricsService);
  }

  @Cron('*/30 * * * *') // Fallback 30 minutes
  async runDeactivateOrderConversationsSweep(): Promise<void> {
    await this.executeJob(async () => {
      await this.conversationQueue.add('deactivate-order-conversations', {
        timestamp: Date.now(),
        batchSize: this.getBatchSize(),
      });
    });
  }
}
