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

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paymentSecretKey: string;
  private readonly paymentApiUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepository: PaymentRepository,
    private readonly configService: ConfigService,
  ) {
    this.paymentSecretKey = this.configService.get<string>(
      'PAYMENT_SECRET_KEY',
      '394feb34-91f5-4305-9c01-1dfe2bfe15ec',
    );
    this.paymentApiUrl = this.configService.get<string>(
      'PAYMENT_API_URL',
      'https://backend.secondbloom.uz/api/payment',
    );
  }

  async createInvoice(userId: string, dto: CreatePaymentDto) {
    const pricing = await this.prisma.publicationPricing.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!pricing) {
      throw new NotFoundException(
        'Publication pricing not configured. Please contact administrator.',
      );
    }

    const pricePerPost = pricing.pricePerPost;
    const totalAmount = pricePerPost.mul(dto.quantity);

    const payment = await this.paymentRepository.create({
      userId,
      paymentType: PaymentType.PUBLICATION,
      amount: totalAmount,
      quantity: dto.quantity,
      method: PaymentMethod.CARD,
      gateway: dto.gateway || 'PAYME',
      status: PaymentStatus.PENDING,
    });

    const invoiceUrl = `${this.paymentApiUrl}/create-invoice`;

    this.logger.log(
      `Payment invoice created: ${payment.id} for user: ${userId}, quantity: ${dto.quantity}, amount: ${totalAmount}`,
    );

    return {
      paymentId: payment.id,
      invoiceUrl,
      amount: totalAmount,
      quantity: dto.quantity,
      pricePerPost,
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
      `Webhook received: invoice_id=${payload.invoice_id}, status=${payload.status}, amount=${payload.amount}`,
    );

    let payment = await this.paymentRepository.findByInvoiceId(
      payload.invoice_id,
    );

    if (!payment) {
      this.logger.warn(
        `Payment not found by invoice_id: ${payload.invoice_id}. Attempting fallback matching.`,
      );

      const webhookAmount = new Prisma.Decimal(payload.amount);
      const whereConditions: Prisma.PaymentWhereInput[] = [];

      if (payload.meta_data?.user_id) {
        whereConditions.push({
          userId: payload.meta_data.user_id,
          status: PaymentStatus.PENDING,
          gatewayOrderId: null,
          amount: webhookAmount,
        });

        whereConditions.push({
          userId: payload.meta_data.user_id,
          status: PaymentStatus.PENDING,
          gatewayOrderId: null,
        });
      }

      whereConditions.push({
        status: PaymentStatus.PENDING,
        gatewayOrderId: null,
        amount: webhookAmount,
      });

      let recentPayment = null;

      for (const condition of whereConditions) {
        recentPayment = await this.prisma.payment.findFirst({
          where: condition,
          orderBy: { createdAt: 'desc' },
        });

        if (recentPayment) {
          this.logger.log(
            `Found pending payment ${recentPayment.id} for user ${recentPayment.userId}, amount: ${recentPayment.amount}. Matching with invoice_id ${payload.invoice_id}.`,
          );
          break;
        }
      }

      if (recentPayment) {
        await this.paymentRepository.update(recentPayment.id, {
          gatewayOrderId: payload.invoice_id.toString(),
          gatewayTransactionId: payload.invoice_id.toString(),
        });
        payment = await this.paymentRepository.findByInvoiceId(
          payload.invoice_id,
        );
        this.logger.log(
          `Payment ${recentPayment.id} matched with invoice_id ${payload.invoice_id}`,
        );
      }

      if (!payment) {
        this.logger.error(
          `Payment not found for invoice_id: ${payload.invoice_id}, amount: ${payload.amount}. Available meta_data: ${JSON.stringify(payload.meta_data)}`,
        );
        throw new NotFoundException(
          `Payment not found for invoice_id: ${payload.invoice_id}. Please ensure payment was created before webhook arrives.`,
        );
      }
    }

    if (payload.status === 'success') {
      return this.handleSuccessfulPayment(payment, payload);
    } else if (payload.status === 'failed' || payload.status === 'cancelled') {
      return this.handleFailedPayment(payment, payload);
    }

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

    const creditsToAdd = payment.quantity;

    return await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          webhookData: JSON.parse(JSON.stringify(payload)),
          gatewayOrderId: payload.invoice_id.toString(),
          gatewayTransactionId: payload.invoice_id.toString(),
        },
      });

      await tx.user.update({
        where: { id: payment.userId },
        data: {
          publicationCredits: {
            increment: creditsToAdd,
          },
        },
      });

      this.logger.log(
        `Added ${creditsToAdd} credits to user ${payment.userId}`,
      );

      return {
        success: true,
        message: 'Payment completed successfully',
        creditsAdded: creditsToAdd,
      };
    });
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

  async getUserPayments(userId: string) {
    return this.paymentRepository.findByUserId(userId);
  }

  async getPaymentById(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
