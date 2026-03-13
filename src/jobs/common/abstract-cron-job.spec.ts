import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../../metrics/metrics.service';
import { AbstractCronJob } from './abstract-cron-job';

class TestCronJob extends AbstractCronJob {
  protected readonly logger = new Logger(TestCronJob.name);
  protected readonly jobName = 'test-job';
  protected readonly configKey = 'test';

  constructor(configService: ConfigService, metricsService: MetricsService) {
    super(configService, metricsService);
  }

  async runJob(logic: () => Promise<void>) {
    await this.executeJob(logic);
  }

  publicBatchSize() {
    return this.getBatchSize();
  }
}

describe('AbstractCronJob', () => {
  let configService: ConfigService;
  let metricsService: MetricsService;
  let configGet: jest.MockedFunction<ConfigService['get']>;
  let recordCronRun: jest.MockedFunction<MetricsService['recordCronRun']>;
  let job: TestCronJob;

  beforeEach(() => {
    configGet = jest.fn();
    configService = { get: configGet } as unknown as ConfigService;

    recordCronRun = jest.fn();
    metricsService = { recordCronRun } as unknown as MetricsService;

    job = new TestCronJob(configService, metricsService);
  });

  it('should not run if global cron is disabled', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'cron.enabled') return false;
      if (key === 'cron.jobs.test.enabled') return true;
      return null;
    });

    const logic = jest.fn().mockResolvedValue(undefined);
    await job.runJob(logic);

    expect(logic).not.toHaveBeenCalled();
    expect(recordCronRun).not.toHaveBeenCalled();
  });

  it('should not run if specific job is disabled', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'cron.enabled') return true;
      if (key === 'cron.jobs.test.enabled') return false;
      return null;
    });

    const logic = jest.fn().mockResolvedValue(undefined);
    await job.runJob(logic);

    expect(logic).not.toHaveBeenCalled();
    expect(recordCronRun).not.toHaveBeenCalled();
  });

  it('should run successfully and record success metric', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'cron.enabled') return true;
      if (key === 'cron.jobs.test.enabled') return true;
      return null;
    });

    const logic = jest.fn().mockResolvedValue(undefined);
    await job.runJob(logic);

    expect(logic).toHaveBeenCalled();
    expect(recordCronRun).toHaveBeenCalledWith(
      'test-job',
      expect.any(Number),
      true,
    );
  });

  it('should handle errors and record failure metric', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'cron.enabled') return true;
      if (key === 'cron.jobs.test.enabled') return true;
      return null;
    });

    const logic = jest.fn().mockRejectedValue(new Error('Test error'));

    await job.runJob(logic);

    expect(logic).toHaveBeenCalled();
    expect(recordCronRun).toHaveBeenCalledWith(
      'test-job',
      expect.any(Number),
      false,
    );
  });

  it('should return batch size from config', () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'cron.jobs.test.batchSize') return 50;
      return null;
    });

    expect(job.publicBatchSize()).toBe(50);
  });

  it('should return default batch size if not configured', () => {
    configGet.mockImplementation(() => {
      return null;
    });

    expect(job.publicBatchSize()).toBe(100);
  });
});
