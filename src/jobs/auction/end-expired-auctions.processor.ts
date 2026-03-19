import {
  Processor,
  Process,
  InjectQueue,
  OnQueueFailed,
  OnQueueError,
  OnQueueStalled,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { AuctionService } from '../../modules/auction/auction.service';

@Processor('auction')
export class EndExpiredAuctionsProcessor {
  private readonly logger = new Logger(EndExpiredAuctionsProcessor.name);

  constructor(
    private readonly auctionService: AuctionService,
    @InjectQueue('auction') private readonly auctionQueue: Queue,
  ) {}

  @Process('end-expired')
  async handleEndExpired(job: Job<{ batchSize?: number }>): Promise<void> {
    this.logger.debug(
      `Processing end expired auctions job ${job.id} at ${new Date(job.timestamp).toISOString()}`,
    );

    try {
      const batchSize = job.data.batchSize || 100;
      const { endedCount, hasMore } =
        await this.auctionService.endExpiredAuctions(batchSize);

      if (endedCount > 0) {
        this.logger.log(
          `Successfully ended ${endedCount} expired auctions (Job ${job.id})`,
        );
      } else {
        this.logger.debug(`No expired auctions to end (Job ${job.id})`);
      }

      if (hasMore) {
        this.logger.warn(
          `More expired auctions found. Rescheduling job ${job.id}`,
        );
        await this.auctionQueue.add(
          'end-expired',
          {
            batchSize,
          },
          { delay: 1000 },
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to end expired auctions (Job ${job.id})`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  @OnQueueFailed()
  onFailed(job: Job<{ batchSize?: number }>, error: Error): void {
    this.logger.error(
      `Auction queue job failed: ${job.name}#${job.id}`,
      error?.stack || error?.message,
    );
  }

  @OnQueueStalled()
  onStalled(job: Job<{ batchSize?: number }>): void {
    this.logger.warn(`Auction queue job stalled: ${job.name}#${job.id}`);
  }

  @OnQueueError()
  onQueueError(error: Error): void {
    this.logger.error(
      'Auction queue encountered an error',
      error?.stack || error?.message,
    );
  }
}
