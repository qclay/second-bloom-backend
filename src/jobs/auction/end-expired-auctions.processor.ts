import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AuctionService } from '../../modules/auction/auction.service';

@Processor('auction')
export class EndExpiredAuctionsProcessor {
  private readonly logger = new Logger(EndExpiredAuctionsProcessor.name);

  constructor(private readonly auctionService: AuctionService) {}

  @Process('end-expired')
  async handleEndExpired(job: Job<{ timestamp: number }>): Promise<void> {
    this.logger.log(
      `Processing end expired auctions job ${job.id} at ${new Date(job.data.timestamp).toISOString()}`,
    );

    try {
      const endedCount = await this.auctionService.endExpiredAuctions();
      this.logger.log(
        `Successfully ended ${endedCount} expired auctions (Job ${job.id})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to end expired auctions (Job ${job.id})`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
