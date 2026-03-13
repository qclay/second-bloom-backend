import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ConversationService } from '../../modules/conversation/conversation.service';

@Processor('conversation')
export class DeactivateOrderConversationsProcessor {
  private readonly logger = new Logger(
    DeactivateOrderConversationsProcessor.name,
  );

  constructor(
    private readonly conversationService: ConversationService,
    @InjectQueue('conversation') private readonly conversationQueue: Queue,
  ) {}

  @Process('deactivate-order-conversations')
  async handleDeactivateOrderConversations(
    job: Job<{ timestamp: number; batchSize?: number }>,
  ): Promise<void> {
    this.logger.log(
      `Processing deactivate order conversations job ${job.id} at ${new Date(
        job.data.timestamp,
      ).toISOString()}`,
    );

    try {
      const batchSize = job.data.batchSize || 100;
      const { deactivatedCount, hasMore } =
        await this.conversationService.deactivateOrderConversationsSweep(
          batchSize,
        );

      this.logger.log(
        `Successfully deactivated ${deactivatedCount} order conversations (Job ${job.id})`,
      );

      if (hasMore) {
        this.logger.log(
          `More conversations to deactivate found. Rescheduling job ${job.id}`,
        );
        await this.conversationQueue.add(
          'deactivate-order-conversations',
          {
            timestamp: Date.now(),
            batchSize,
          },
          { delay: 1000 },
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to deactivate order conversations (Job ${job.id})`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  @Process('deactivate-conversation-by-order')
  async handleDeactivateConversationByOrder(
    job: Job<{ orderId: string; productId: string }>,
  ): Promise<void> {
    this.logger.log(
      `Processing delayed deactivation for order ${job.data.orderId}`,
    );

    try {
      await this.conversationService.deactivateConversationByProductId(
        job.data.productId,
      );
      this.logger.log(
        `Successfully deactivated conversation for order ${job.data.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to deactivate conversation for order ${job.data.orderId}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
