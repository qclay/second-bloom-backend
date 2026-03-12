import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AuctionService } from '../../modules/auction/auction.service';
import { FinishAuctionJobData } from '../../modules/auction/auction-scheduling.service';

@Processor('auction')
export class FinishAuctionProcessor {
  private readonly logger = new Logger(FinishAuctionProcessor.name);

  constructor(private readonly auctionService: AuctionService) {}

  @Process('finish-auction')
  async handleFinishAuction(job: Job<FinishAuctionJobData>): Promise<void> {
    this.logger.log(
      `Processing finish auction job ${job.id} for auction ${job.data.auctionId} (scheduled at ${job.data.endTime})`,
    );

    try {
      await this.auctionService.processAuctionCompletionJob(job.data.auctionId);
    } catch (error) {
      this.logger.error(
        `Failed to finalize auction ${job.data.auctionId} (Job ${job.id})`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
