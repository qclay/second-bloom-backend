import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentRepository } from './repositories/payment.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { SignatureVerifier } from './utils/signature-verifier';
import { PaymentWithRelations } from './interfaces/payment-with-relations.interface';
import { PaymentGateway } from './gateways/payment.gateway';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paymentSecretKey: string;
  private readonly paymentApiUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
    private readonly configService: ConfigService,
    private readonly paymentGateway: PaymentGateway,
    @InjectQueue('payment') private readonly paymentQueue: Queue,
  ) {
    this.paymentSecretKey =
      this.configService.get<string>('PAYMENT_SECRET_KEY') ?? '';
    this.paymentApiUrl =
      this.configService.get<string>('PAYMENT_API_URL') ??
      'https://payment.secondbloom.uz/api/payment';
  }

  async createInvoice(userId: string, dto: CreatePaymentDto) {
    const paymentType = dto.paymentType || PaymentType.PUBLICATION;

    let totalAmount: Prisma.Decimal;
    let quantity = 1;
    let pricePerPost: Prisma.Decimal | undefined;

    if (paymentType === PaymentType.TOP_UP) {
      if (!dto.amount || dto.amount <= 0) {
        throw new BadRequestException(
          'Amount is required for balance top-up and must be greater than 0',
        );
      }
      totalAmount = new Prisma.Decimal(dto.amount);
      quantity = 1;
    } else {
      const pricing = await this.prisma.publicationPricing.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!pricing) {
        throw new NotFoundException(
          'Publication pricing not configured. Please contact administrator.',
        );
      }

      if (!dto.quantity || dto.quantity < 1) {
        throw new BadRequestException(
          'Quantity is required for publication payment and must be at least 1',
        );
      }

      pricePerPost = pricing.pricePerPost;
      totalAmount = pricePerPost.mul(dto.quantity);
      quantity = dto.quantity;
    }

    const payment = await this.paymentRepository.create({
      userId,
      paymentType,
      amount: totalAmount,
      quantity,
      method: PaymentMethod.CARD,
      gateway: dto.gateway || 'PAYME',
      status: PaymentStatus.PENDING,
    });

    const invoiceUrl = `${this.paymentApiUrl}/create-invoice`;

    this.logger.log(
      `Payment invoice created: ${payment.id} for user: ${userId}, type: ${paymentType}, quantity: ${quantity}, amount: ${totalAmount.toString()}`,
    );

    // Schedule delayed expiration job
    const maxAgeMs = this.configService.get<number>(
      'cron.jobs.payments.maxAgeMs',
      3600000,
    ); // Default 1 hour
    await this.paymentQueue.add(
      'expire-payment',
      { paymentId: payment.id },
      { delay: maxAgeMs },
    );

    return {
      paymentId: payment.id,
      invoiceUrl,
      amount: Number(totalAmount),
      quantity,
      paymentType,
      ...(pricePerPost && { pricePerPost: Number(pricePerPost) }),
    };
  }

  async handleWebhook(signature: string, payload: WebhookPayloadDto) {
    const isValid = SignatureVerifier.verifyWebhook(
      signature,
      payload as unknown as Record<string, unknown>,
      this.paymentSecretKey,
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    this.logger.log(
      `Webhook received: invoice_id=${payload.invoice_id}, status=${payload.status}, amount=${payload.amount}, meta_data=${JSON.stringify(payload.meta_data)}`,
    );

    const webhookAmountRaw = new Prisma.Decimal(payload.amount);
    const webhookAmountSum =
      payload.amount >= 100
        ? new Prisma.Decimal(Math.floor(payload.amount / 100))
        : webhookAmountRaw;
    const amountsToTry = [webhookAmountRaw, webhookAmountSum].filter(
      (a, i, arr) => arr.findIndex((b) => b.eq(a)) === i,
    );

    const whereConditions: Prisma.PaymentWhereInput[] = [];

    if (payload.meta_data?.user_id) {
      for (const amt of amountsToTry) {
        whereConditions.push({
          userId: payload.meta_data.user_id,
          status: PaymentStatus.PENDING,
          amount: amt,
        });
      }
      whereConditions.push({
        userId: payload.meta_data.user_id,
        status: PaymentStatus.PENDING,
      });
    } else {
      for (const amt of amountsToTry) {
        whereConditions.push({
          status: PaymentStatus.PENDING,
          amount: amt,
        });
      }
    }

    let payment: PaymentWithRelations | null = null;

    for (const condition of whereConditions) {
      payment = (await this.prisma.payment.findFirst({
        where: condition,
        orderBy: { createdAt: 'desc' },
      })) as unknown as PaymentWithRelations | null;

      if (payment) {
        this.logger.log(
          `Found pending payment ${payment.id} for user ${payment.userId}, amount: ${payment.amount.toString()}. Matching with invoice_id ${payload.invoice_id}.`,
        );
        break;
      }
    }

    if (!payment) {
      this.logger.error(
        `Payment not found for invoice_id: ${payload.invoice_id}, amount: ${payload.amount}. Available meta_data: ${JSON.stringify(payload.meta_data)}`,
      );
      throw new NotFoundException(
        `Payment not found for invoice_id: ${payload.invoice_id}. Please ensure payment was created before webhook arrives.`,
      );
    }

    if (payload.status === 'success' || payload.status === 'completed') {
      return this.handleSuccessfulPayment(payment, payload);
    }
    if (payload.status === 'failed' || payload.status === 'cancelled') {
      return this.handleFailedPayment(payment, payload);
    }

    this.logger.warn(
      `Webhook ignored: status="${payload.status}" (not success/completed). User balance/credits were NOT updated for payment ${payment.id}.`,
    );
    return { success: true, message: 'Webhook processed' };
  }

  private async handleSuccessfulPayment(
    payment: PaymentWithRelations,
    payload: WebhookPayloadDto,
  ) {
    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.warn(`Payment ${payment.id} already processed`);
      return { success: true, message: 'Payment already processed' };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          webhookData: JSON.parse(JSON.stringify(payload)),
          gatewayTransactionId: payload.invoice_id.toString(),
        },
      });

      const updateData: Prisma.UserUpdateInput = {};

      if (payment.paymentType === PaymentType.TOP_UP) {
        updateData.balance = {
          increment: payment.amount,
        };
        this.logger.log(
          `Added ${payment.amount.toString()} to balance for user ${payment.userId}`,
        );
      } else {
        const creditsToAdd = Math.max(1, payment.quantity ?? 1);
        updateData.publicationCredits = {
          increment: creditsToAdd,
        };
        this.logger.log(
          `Added ${creditsToAdd} publication credit(s) to user ${payment.userId}`,
        );
      }

      await tx.user.update({
        where: { id: payment.userId },
        data: updateData,
      });

      const creditsAdded =
        payment.paymentType !== PaymentType.TOP_UP
          ? Math.max(1, payment.quantity ?? 1)
          : undefined;

      this.logger.log(
        `User ${payment.userId} updated: ${payment.paymentType === PaymentType.TOP_UP ? `balance += ${payment.amount.toString()}` : `publicationCredits += ${creditsAdded}`}`,
      );

      return {
        success: true,
        message: 'Payment completed successfully',
        ...(payment.paymentType === PaymentType.TOP_UP
          ? { balanceAdded: Number(payment.amount) }
          : { creditsAdded }),
      };
    });

    this.paymentGateway.notifyPaymentSuccess(payment.userId, {
      paymentId: payment.id,
      amount: Number(payment.amount),
      paymentType: payment.paymentType,
      quantity: payment.quantity,
      ...(payment.paymentType === PaymentType.TOP_UP
        ? { balanceAdded: Number(payment.amount) }
        : {
            creditsAdded: Math.max(1, payment.quantity ?? 1),
          }),
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  private async handleFailedPayment(
    payment: PaymentWithRelations,
    payload: WebhookPayloadDto,
  ) {
    await this.paymentRepository.update(payment.id, {
      status: PaymentStatus.FAILED,
      webhookData: JSON.parse(JSON.stringify(payload)),
    });

    this.logger.log(`Payment ${payment.id} marked as failed`);

    return { success: true, message: 'Payment marked as failed' };
  }

  private serializePayment(payment: PaymentWithRelations) {
    const rest = { ...payment };
    delete (rest as Record<string, unknown>).gatewayTransactionId;

    return {
      ...rest,
      amount: Number(payment.amount),
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    };
  }

  async getUserPayments(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: ReturnType<PaymentService['serializePayment']>[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const [payments, total] = await Promise.all([
      this.paymentRepository.findByUserId(userId, { skip, take: maxLimit }),
      this.paymentRepository.countByUserId(userId),
    ]);

    return {
      data: payments.map((payment) => this.serializePayment(payment)),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
        hasNextPage: page * maxLimit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getPaymentById(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.serializePayment(payment);
  }

  async expireStalePendingPayments(
    maxAgeHours = 24,
    batchSize = 100,
  ): Promise<{ expiredCount: number; hasMore: boolean }> {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    // Find IDs first to limit batch size
    const paymentsToExpire = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: { lt: cutoff },
      },
      select: { id: true },
      take: batchSize,
    });

    if (paymentsToExpire.length === 0) {
      return { expiredCount: 0, hasMore: false };
    }

    const idsToExpire = paymentsToExpire.map((p) => p.id);

    const result = await this.prisma.payment.updateMany({
      where: {
        id: { in: idsToExpire },
      },
      data: { status: PaymentStatus.EXPIRED },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} stale pending payments`);
    }

    return {
      expiredCount: result.count,
      hasMore: paymentsToExpire.length === batchSize,
    };
  }

  async expirePaymentIfPending(paymentId: string): Promise<void> {
    const result = await this.prisma.payment.updateMany({
      where: {
        id: paymentId,
        status: PaymentStatus.PENDING,
      },
      data: { status: PaymentStatus.EXPIRED },
    });

    if (result.count > 0) {
      this.logger.log(`Payment ${paymentId} expired due to delayed job`);
    }
  }
}
