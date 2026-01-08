import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EndExpiredAuctionsScheduler {
  private readonly logger = new Logger(EndExpiredAuctionsScheduler.name);

  constructor(@InjectQueue('auction') private readonly auctionQueue: Queue) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduleEndExpiredAuctions(): Promise<void> {
    this.logger.log('Scheduling end expired auctions job');
    try {
      await this.auctionQueue.add('end-expired', {
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error(
        'Failed to schedule end expired auctions job',
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
