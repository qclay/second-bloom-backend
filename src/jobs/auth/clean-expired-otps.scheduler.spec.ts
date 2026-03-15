import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { CleanExpiredOtpsScheduler } from './clean-expired-otps.scheduler';
import { MetricsService } from '../../metrics/metrics.service';

describe('CleanExpiredOtpsScheduler', () => {
  let scheduler: CleanExpiredOtpsScheduler;
  let queue: any;
  let configService: ConfigService;
  let metricsService: MetricsService;

  beforeEach(async () => {
    queue = {
      add: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleanExpiredOtpsScheduler,
        {
          provide: getQueueToken('auth'),
          useValue: queue,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'cron.enabled') return true;
              if (key === 'cron.jobs.otps.enabled') return true;
              if (key === 'cron.jobs.otps.batchSize') return 100;
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

    scheduler = module.get<CleanExpiredOtpsScheduler>(CleanExpiredOtpsScheduler);
    configService = module.get<ConfigService>(ConfigService);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should add "clean-expired-otps" job to the auth queue', async () => {
    await scheduler.scheduleCleanExpiredOtps();

    expect(queue.add).toHaveBeenCalledWith('clean-expired-otps', {
      timestamp: expect.any(Number),
      batchSize: 100,
    });
    expect(metricsService.recordCronRun).toHaveBeenCalledWith(
      'clean-expired-otps',
      expect.any(Number),
      true,
    );
  });
});
