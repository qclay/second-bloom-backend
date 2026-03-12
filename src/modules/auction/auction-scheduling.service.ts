import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface FinishAuctionJobData {
  auctionId: string;
  endTime: string;
}

@Injectable()
export class AuctionSchedulingService {
  private static readonly JOB_PREFIX = 'finish-auction:';
  private static readonly MAX_DELAY_MS = 2_147_483_647; // 2^31 - 1

  private readonly logger = new Logger(AuctionSchedulingService.name);

  constructor(@InjectQueue('auction') private readonly auctionQueue: Queue) {}

  private buildJobId(auctionId: string): string {
    return `${AuctionSchedulingService.JOB_PREFIX}${auctionId}`;
  }

  async scheduleAuctionEnd(auctionId: string, endTime: Date): Promise<void> {
    const now = Date.now();
    const desiredDelay = Math.max(0, endTime.getTime() - now);
    let delay = desiredDelay;

    if (desiredDelay > AuctionSchedulingService.MAX_DELAY_MS) {
      delay = AuctionSchedulingService.MAX_DELAY_MS;
      this.logger.warn(
        `Delay ${desiredDelay}ms for auction ${auctionId} exceeds limit. Scheduling with capped delay ${delay}ms and relying on fail-safe cron.`,
      );
    }

    const payload: FinishAuctionJobData = {
      auctionId,
      endTime: endTime.toISOString(),
    };

    await this.auctionQueue.add('finish-auction', payload, {
      jobId: this.buildJobId(auctionId),
      delay,
      removeOnComplete: true,
      removeOnFail: true,
    });
  }

  async cancelAuctionEnd(auctionId: string): Promise<void> {
    try {
      const job = await this.auctionQueue.getJob(this.buildJobId(auctionId));
      if (job) {
        await job.remove();
      }
    } catch (error) {
      this.logger.warn(
        `Failed to cancel auction job for ${auctionId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async rescheduleAuctionEnd(auctionId: string, endTime: Date): Promise<void> {
    await this.cancelAuctionEnd(auctionId);
    await this.scheduleAuctionEnd(auctionId, endTime);
  }
}
