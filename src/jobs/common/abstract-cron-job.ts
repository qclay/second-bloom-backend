import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../../metrics/metrics.service';

export abstract class AbstractCronJob {
  protected abstract readonly logger: Logger;
  protected abstract readonly jobName: string;
  protected abstract readonly configKey: string;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly metricsService: MetricsService,
  ) {}

  protected async executeJob(jobLogic: () => Promise<void>): Promise<void> {
    const isGlobalCronEnabled = this.configService.get<boolean>('cron.enabled');
    const isJobEnabled = this.configService.get<boolean>(
      `cron.jobs.${this.configKey}.enabled`,
    );

    if (!isGlobalCronEnabled || !isJobEnabled) {
      this.logger.debug(
        `Cron job ${this.jobName} is disabled by configuration.`,
      );
      return;
    }

    const startTime = Date.now();
    this.logger.log(`Starting cron job: ${this.jobName}`);

    try {
      await jobLogic();

      const duration = Date.now() - startTime;
      this.logger.log(
        `Successfully completed cron job: ${this.jobName} in ${duration}ms`,
      );

      // We will record metrics here
      this.metricsService.recordCronRun(this.jobName, duration, true);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to execute cron job: ${this.jobName} after ${duration}ms`,
        error.stack,
      );

      // We will record failure metrics here
      this.metricsService.recordCronRun(this.jobName, duration, false);
    }
  }

  protected getBatchSize(): number {
    return (
      this.configService.get<number>(`cron.jobs.${this.configKey}.batchSize`) ||
      100
    );
  }
}
