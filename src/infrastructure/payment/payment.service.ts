import { Injectable, Logger } from '@nestjs/common';
import { IPaymentService } from './payment-service.interface';
import { PaymentGateway } from '@prisma/client';
import { PaymeStrategy } from './strategies/payme.strategy';
import { ClickStrategy } from './strategies/click.strategy';

@Injectable()
export class PaymentService implements IPaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymeStrategy: PaymeStrategy,
    private readonly clickStrategy: ClickStrategy,
  ) {}

  private getStrategy(gateway: PaymentGateway) {
    switch (gateway) {
      case PaymentGateway.PAYME:
        return this.paymeStrategy;
      case PaymentGateway.CLICK:
        return this.clickStrategy;
      default:
        throw new Error(`Unsupported payment gateway: ${String(gateway)}`);
    }
  }

  async initiatePayment(
    amount: number,
    orderId: string,
    gateway: PaymentGateway,
    transactionId: string,
  ): Promise<{
    transactionId: string;
    redirectUrl?: string;
    paymentUrl?: string;
    gatewayTransactionId?: string;
    gatewayOrderId?: string;
  }> {
    const strategy = this.getStrategy(gateway);
    const result = await strategy.initiatePayment(
      amount,
      orderId,
      transactionId,
    );
    return {
      ...result,
      transactionId,
    };
  }

  async verifyPayment(
    transactionId: string,
    gateway: PaymentGateway,
    gatewayTransactionId: string,
  ): Promise<boolean> {
    const strategy = this.getStrategy(gateway);
    const result = await strategy.verifyPayment(
      gatewayTransactionId,
      transactionId,
    );
    return result.success && result.status === 'COMPLETED';
  }

  async refundPayment(
    transactionId: string,
    amount: number,
    gateway: PaymentGateway,
    gatewayTransactionId: string,
  ): Promise<boolean> {
    const strategy = this.getStrategy(gateway);
    const result = await strategy.refundPayment(
      gatewayTransactionId,
      amount,
      transactionId,
    );
    return result.success;
  }

  verifyWebhook(
    gateway: PaymentGateway,
    payload: unknown,
    headers: Record<string, string>,
  ): boolean {
    const strategy = this.getStrategy(gateway);
    return strategy.verifyWebhook(payload, headers);
  }

  async processWebhook(
    gateway: PaymentGateway,
    payload: unknown,
  ): Promise<{
    transactionId?: string;
    orderId?: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    gatewayTransactionId?: string;
    amount?: number;
  }> {
    const strategy = this.getStrategy(gateway);
    return strategy.processWebhook(payload);
  }
}
