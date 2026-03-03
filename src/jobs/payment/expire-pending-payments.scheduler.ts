import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../../modules/payment/payment.service';

@Injectable()
export class ExpirePendingPaymentsScheduler {
  private readonly logger = new Logger(ExpirePendingPaymentsScheduler.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runExpirePendingPayments(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (nodeEnv !== 'production') {
      return;
    }
    const enabled = this.configService.get<string>(
      'PAYMENT_EXPIRE_CRON_ENABLED',
      'true',
    );
    if (enabled !== 'true' && enabled !== '1') {
      return;
    }
    const maxAgeHours = this.configService.get<number>(
      'PAYMENT_PENDING_EXPIRE_HOURS',
      24,
    );
    this.logger.log('Running expire pending payments sweep');
    try {
      const count =
        await this.paymentService.expireStalePendingPayments(maxAgeHours);
      this.logger.log(`Expire sweep completed: ${count} payment(s) expired`);
    } catch (error) {
      this.logger.error(
        'Expire pending payments sweep failed',
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
