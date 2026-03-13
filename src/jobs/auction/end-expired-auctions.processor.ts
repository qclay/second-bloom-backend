import { Processor, Process, InjectQueue } from '@nestjs/bull';
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
  async handleEndExpired(
    job: Job<{ timestamp: number; batchSize?: number }>,
  ): Promise<void> {
    this.logger.log(
      `Processing end expired auctions job ${job.id} at ${new Date(job.data.timestamp).toISOString()}`,
    );

    try {
      const batchSize = job.data.batchSize || 100;
      const { endedCount, hasMore } =
        await this.auctionService.endExpiredAuctions(batchSize);

      this.logger.log(
        `Successfully ended ${endedCount} expired auctions (Job ${job.id})`,
      );

      if (hasMore) {
        this.logger.log(
          `More expired auctions found. Rescheduling job ${job.id}`,
        );
        await this.auctionQueue.add(
          'end-expired',
          {
            timestamp: Date.now(),
            batchSize,
          },
          { delay: 1000 },
        ); // 1 second delay to yield event loop
      }
    } catch (error) {
      this.logger.error(
        `Failed to end expired auctions (Job ${job.id})`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
