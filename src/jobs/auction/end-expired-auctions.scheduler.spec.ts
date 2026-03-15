import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EndExpiredAuctionsScheduler } from './end-expired-auctions.scheduler';
import { MetricsService } from '../../metrics/metrics.service';

describe('EndExpiredAuctionsScheduler', () => {
  let scheduler: EndExpiredAuctionsScheduler;
  let queue: any;
  let configService: ConfigService;
  let metricsService: MetricsService;

  beforeEach(async () => {
    queue = {
      add: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EndExpiredAuctionsScheduler,
        {
          provide: getQueueToken('auction'),
          useValue: queue,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'cron.enabled') return true;
              if (key === 'cron.jobs.auctions.enabled') return true;
              if (key === 'cron.jobs.auctions.batchSize') return 50;
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

    scheduler = module.get<EndExpiredAuctionsScheduler>(
      EndExpiredAuctionsScheduler,
    );
    configService = module.get<ConfigService>(ConfigService);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should add "end-expired" job to the auction queue', async () => {
    await scheduler.scheduleEndExpiredAuctions();

    expect(queue.add).toHaveBeenCalledWith('end-expired', {
      timestamp: expect.any(Number),
      batchSize: 50,
    });
    expect(metricsService.recordCronRun).toHaveBeenCalledWith(
      'end-expired-auctions',
      expect.any(Number),
      true,
    );
  });

  it('should not add job if cron is disabled globally', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'cron.enabled') return false;
      return true;
    });

    await scheduler.scheduleEndExpiredAuctions();

    expect(queue.add).not.toHaveBeenCalled();
  });

  it('should not add job if this specific job is disabled', async () => {
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'cron.enabled') return true;
      if (key === 'cron.jobs.auctions.enabled') return false;
      return true;
    });

    await scheduler.scheduleEndExpiredAuctions();

    expect(queue.add).not.toHaveBeenCalled();
  });
});
