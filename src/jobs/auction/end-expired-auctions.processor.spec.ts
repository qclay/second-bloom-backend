import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { EndExpiredAuctionsProcessor } from './end-expired-auctions.processor';
import { AuctionService } from '../../modules/auction/auction.service';

describe('EndExpiredAuctionsProcessor', () => {
  let processor: EndExpiredAuctionsProcessor;
  let queue: Partial<Queue>;
  let auctionService: { endExpiredAuctions: jest.Mock };

  beforeEach(async () => {
    queue = {
      add: jest.fn().mockResolvedValue({}),
    };

    auctionService = {
      endExpiredAuctions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EndExpiredAuctionsProcessor,
        {
          provide: AuctionService,
          useValue: auctionService,
        },
        {
          provide: getQueueToken('auction'),
          useValue: queue,
        },
      ],
    }).compile();

    processor = module.get<EndExpiredAuctionsProcessor>(
      EndExpiredAuctionsProcessor,
    );
  });

  it('should process job with provided batch size', async () => {
    auctionService.endExpiredAuctions.mockResolvedValue({
      endedCount: 3,
      hasMore: false,
    });

    const job = {
      id: 42,
      data: { batchSize: 77 },
      timestamp: Date.now(),
      name: 'end-expired',
    } as unknown as Job<{ batchSize?: number }>;

    await processor.handleEndExpired(job);

    expect(auctionService.endExpiredAuctions).toHaveBeenCalledWith(77);
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('should process job with default batch size when missing', async () => {
    auctionService.endExpiredAuctions.mockResolvedValue({
      endedCount: 0,
      hasMore: false,
    });

    const job = {
      id: 43,
      data: {},
      timestamp: Date.now(),
      name: 'end-expired',
    } as unknown as Job<{ batchSize?: number }>;

    await processor.handleEndExpired(job);

    expect(auctionService.endExpiredAuctions).toHaveBeenCalledWith(100);
  });

  it('should enqueue follow-up job when hasMore=true', async () => {
    auctionService.endExpiredAuctions.mockResolvedValue({
      endedCount: 100,
      hasMore: true,
    });

    const job = {
      id: 44,
      data: { batchSize: 25 },
      timestamp: Date.now(),
      name: 'end-expired',
    } as unknown as Job<{ batchSize?: number }>;

    await processor.handleEndExpired(job);

    expect(queue.add).toHaveBeenCalledWith(
      'end-expired',
      {
        batchSize: 25,
      },
      { delay: 1000 },
    );
  });

  it('should rethrow when auction service fails', async () => {
    auctionService.endExpiredAuctions.mockRejectedValue(new Error('boom'));

    const job = {
      id: 45,
      data: { batchSize: 10 },
      timestamp: Date.now(),
      name: 'end-expired',
    } as unknown as Job<{ batchSize?: number }>;

    await expect(processor.handleEndExpired(job)).rejects.toThrow('boom');
  });

  it('should log failed queue jobs without throwing', () => {
    const job = {
      id: 46,
      data: { batchSize: 10 },
      timestamp: Date.now(),
      name: 'end-expired',
    } as unknown as Job<{ batchSize?: number }>;

    expect(() => processor.onFailed(job, new Error('failed'))).not.toThrow();
  });

  it('should log stalled queue jobs without throwing', () => {
    const job = {
      id: 47,
      data: { batchSize: 10 },
      timestamp: Date.now(),
      name: 'end-expired',
    } as unknown as Job<{ batchSize?: number }>;

    expect(() => processor.onStalled(job)).not.toThrow();
  });

  it('should log queue errors without throwing', () => {
    expect(() => processor.onQueueError(new Error('queue down'))).not.toThrow();
  });
});
