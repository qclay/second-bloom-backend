import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { ExpirePendingPaymentsScheduler } from './expire-pending-payments.scheduler';
import { MetricsService } from '../../metrics/metrics.service';

describe('ExpirePendingPaymentsScheduler', () => {
  let scheduler: ExpirePendingPaymentsScheduler;
  let queue: any;
  let configService: ConfigService;
  let metricsService: MetricsService;

  beforeEach(async () => {
    queue = {
      add: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpirePendingPaymentsScheduler,
        {
          provide: getQueueToken('payment'),
          useValue: queue,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'cron.enabled') return true;
              if (key === 'cron.jobs.payments.enabled') return true;
              if (key === 'cron.jobs.payments.batchSize') return 100;
              if (key === 'cron.jobs.payments.maxAgeMs') return 3600000;
              return null;
            }),
          },
        },
        {
          provide: MetricsService,
          useValue: {
            recordCronRun: jest.fn(),
          },
        },
      ],
    }).compile();

    scheduler = module.get<ExpirePendingPaymentsScheduler>(ExpirePendingPaymentsScheduler);
    configService = module.get<ConfigService>(ConfigService);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should add "expire-stale" job to the payment queue', async () => {
    await scheduler.runExpirePendingPayments();

    expect(queue.add).toHaveBeenCalledWith('expire-stale', {
      timestamp: expect.any(Number),
      batchSize: 100,
      maxAgeMs: 3600000,
    });
    expect(metricsService.recordCronRun).toHaveBeenCalledWith(
      'expire-pending-payments',
      expect.any(Number),
      true,
    );
  });
});
