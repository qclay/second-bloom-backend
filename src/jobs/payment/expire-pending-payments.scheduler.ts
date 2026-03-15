import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AbstractCronJob } from '../common/abstract-cron-job';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class ExpirePendingPaymentsScheduler extends AbstractCronJob {
  protected readonly logger = new Logger(ExpirePendingPaymentsScheduler.name);
  protected readonly jobName = 'expire-pending-payments';
  protected readonly configKey = 'payments';

  constructor(
    @InjectQueue('payment') private readonly paymentQueue: Queue,
    configService: ConfigService,
    metricsService: MetricsService,
  ) {
    super(configService, metricsService);
  }

  @Cron('0 * * * *', { name: 'expire-pending-payments' })
  async runExpirePendingPayments(): Promise<void> {
    await this.executeJob(async () => {
      await this.paymentQueue.add('expire-stale', {
        timestamp: Date.now(),
        batchSize: this.getBatchSize(),
        maxAgeMs: this.configService.get<number>('cron.jobs.payments.maxAgeMs'),
      });
    });
  }
}
