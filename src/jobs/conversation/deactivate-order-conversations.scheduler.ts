import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConversationService } from '../../modules/conversation/conversation.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeactivateOrderConversationsScheduler {
  private readonly logger = new Logger(
    DeactivateOrderConversationsScheduler.name,
  );

  constructor(
    private readonly conversationService: ConversationService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async runDeactivateOrderConversationsSweep(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv !== 'production') {
      return;
    }
    this.logger.log('Running deactivate order conversations sweep');
    try {
      const count =
        await this.conversationService.deactivateOrderConversationsSweep();
      this.logger.log(`Sweep completed: ${count} conversation(s) deactivated`);
    } catch (error) {
      this.logger.error(
        'Deactivate order conversations sweep failed',
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
