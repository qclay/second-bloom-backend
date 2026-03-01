import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EndExpiredAuctionsScheduler {
  private readonly logger = new Logger(EndExpiredAuctionsScheduler.name);

  constructor(
    @InjectQueue('auction') private readonly auctionQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async scheduleEndExpiredAuctions(): Promise<void> {
    const enabled = this.configService.get<string>(
      'AUCTION_END_CRON_ENABLED',
      'true',
    );
    if (enabled !== 'true' && enabled !== '1') {
      return;
    }
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
