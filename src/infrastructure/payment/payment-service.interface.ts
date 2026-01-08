import { PaymentGateway } from '@prisma/client';

export interface IPaymentService {
  initiatePayment(
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
  }>;
  verifyPayment(
    transactionId: string,
    gateway: PaymentGateway,
    gatewayTransactionId: string,
  ): Promise<boolean>;
  refundPayment(
    transactionId: string,
    amount: number,
    gateway: PaymentGateway,
    gatewayTransactionId: string,
  ): Promise<boolean>;
  verifyWebhook(
    gateway: PaymentGateway,
    payload: unknown,
    headers: Record<string, string>,
  ): boolean;
  processWebhook(
    gateway: PaymentGateway,
    payload: unknown,
  ): Promise<{
    transactionId?: string;
    orderId?: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    gatewayTransactionId?: string;
    amount?: number;
  }>;
}
