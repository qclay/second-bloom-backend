import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AbstractCronJob } from '../common/abstract-cron-job';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class EndExpiredAuctionsScheduler
  extends AbstractCronJob
  implements OnModuleInit
{
  protected readonly logger = new Logger(EndExpiredAuctionsScheduler.name);
  protected readonly jobName = 'end-expired-auctions';
  protected readonly configKey = 'auctions';
  private readonly repeatableJobId = 'end-expired-auctions-repeatable';

  constructor(
    @InjectQueue('auction') private readonly auctionQueue: Queue,
    configService: ConfigService,
    metricsService: MetricsService,
  ) {
    super(configService, metricsService);
  }

  async onModuleInit(): Promise<void> {
    await this.registerRepeatableAuctionSweep();
  }

  async registerRepeatableAuctionSweep(): Promise<void> {
    await this.executeJob(async () => {
      const cronExpression =
        this.configService.get<string>('cron.jobs.auctions.expression') ||
        '*/30 * * * * *';

      const repeatableJobs =
        typeof this.auctionQueue.getRepeatableJobs === 'function'
          ? await this.auctionQueue.getRepeatableJobs()
          : [];
      const alreadyRegistered = repeatableJobs.some(
        (job) =>
          job.name === 'end-expired' &&
          job.cron === cronExpression &&
          job.id === this.repeatableJobId,
      );

      if (alreadyRegistered) {
        this.logger.debug(
          `Repeatable job already registered: ${this.jobName} (${cronExpression})`,
        );
        return;
      }

      await this.auctionQueue.add(
        'end-expired',
        {
          batchSize: this.getBatchSize(),
        },
        {
          jobId: this.repeatableJobId,
          repeat: {
            cron: cronExpression,
          },
        },
      );

      this.logger.log(
        `Registered repeatable job: ${this.jobName} (${cronExpression})`,
      );
    });
  }

  async scheduleEndExpiredAuctions(): Promise<void> {
    await this.executeJob(async () => {
      await this.auctionQueue.add('end-expired', {
        batchSize: this.getBatchSize(),
      });
    });
  }
}
