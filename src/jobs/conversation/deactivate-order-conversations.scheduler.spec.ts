import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { DeactivateOrderConversationsScheduler } from './deactivate-order-conversations.scheduler';
import { MetricsService } from '../../metrics/metrics.service';

describe('DeactivateOrderConversationsScheduler', () => {
  let scheduler: DeactivateOrderConversationsScheduler;
  let queue: any;
  let configService: ConfigService;
  let metricsService: MetricsService;

  beforeEach(async () => {
    queue = {
      add: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateOrderConversationsScheduler,
        {
          provide: getQueueToken('conversation'),
          useValue: queue,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'cron.enabled') return true;
              if (key === 'cron.jobs.conversations.enabled') return true;
              if (key === 'cron.jobs.conversations.batchSize') return 100;
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

    scheduler = module.get<DeactivateOrderConversationsScheduler>(
      DeactivateOrderConversationsScheduler,
    );
    configService = module.get<ConfigService>(ConfigService);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should add "deactivate-order-conversations" job to the conversation queue', async () => {
    await scheduler.runDeactivateOrderConversationsSweep();

    expect(queue.add).toHaveBeenCalledWith('deactivate-order-conversations', {
      timestamp: expect.any(Number),
      batchSize: 100,
    });
    expect(metricsService.recordCronRun).toHaveBeenCalledWith(
      'deactivate-order-conversations',
      expect.any(Number),
      true,
    );
  });
});
