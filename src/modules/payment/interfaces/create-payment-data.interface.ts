import {
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  Prisma,
} from '@prisma/client';

export interface CreatePaymentData {
  userId: string;
  paymentType: PaymentType;
  amount: Prisma.Decimal;
  quantity: number;
  method: PaymentMethod;
  gateway?: PaymentGateway;
  status: PaymentStatus;
  transactionId?: string;
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
}

export interface UpdatePaymentData {
  status?: PaymentStatus;
  paidAt?: Date;
  webhookData?: Prisma.InputJsonValue;
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  transactionId?: string;
}
