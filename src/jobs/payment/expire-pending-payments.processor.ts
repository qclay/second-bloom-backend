import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { PaymentService } from '../../modules/payment/payment.service';

@Processor('payment')
export class ExpirePendingPaymentsProcessor {
  private readonly logger = new Logger(ExpirePendingPaymentsProcessor.name);

  constructor(
    private readonly paymentService: PaymentService,
    @InjectQueue('payment') private readonly paymentQueue: Queue,
  ) {}

  @Process('expire-stale')
  async handleExpireStalePayments(
    job: Job<{ timestamp: number; batchSize?: number; maxAgeMs?: number }>,
  ): Promise<void> {
    this.logger.log(
      `Processing expire pending payments job ${job.id} at ${new Date(
        job.data.timestamp,
      ).toISOString()}`,
    );

    try {
      const batchSize = job.data.batchSize || 100;
      const maxAgeMs = job.data.maxAgeMs || 24 * 60 * 60 * 1000;
      const maxAgeHours = maxAgeMs / (1000 * 60 * 60);

      const { expiredCount, hasMore } =
        await this.paymentService.expireStalePendingPayments(
          maxAgeHours,
          batchSize,
        );

      this.logger.log(
        `Successfully expired ${expiredCount} pending payments (Job ${job.id})`,
      );

      if (hasMore) {
        this.logger.log(
          `More pending payments found. Rescheduling job ${job.id}`,
        );
        await this.paymentQueue.add(
          'expire-stale',
          {
            timestamp: Date.now(),
            batchSize,
            maxAgeMs,
          },
          { delay: 1000 },
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to expire pending payments (Job ${job.id})`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  @Process('expire-payment')
  async handleExpireSinglePayment(
    job: Job<{ paymentId: string }>,
  ): Promise<void> {
    this.logger.log(
      `Processing delayed expiration for payment ${job.data.paymentId}`,
    );

    try {
      await this.paymentService.expirePaymentIfPending(job.data.paymentId);
      this.logger.log(
        `Successfully processed delayed expiration for payment ${job.data.paymentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process delayed expiration for payment ${job.data.paymentId}`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
