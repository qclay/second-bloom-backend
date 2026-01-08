import { PaymentRepository } from './repositories/payment.repository';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { PaymentMethod, PaymentGateway, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentService as InfrastructurePaymentService } from '../../infrastructure/payment/payment.service';
import { ConfigService } from '@nestjs/config';
export declare class PaymentService {
    private readonly paymentRepository;
    private readonly prisma;
    private readonly infrastructurePaymentService;
    private readonly configService;
    private readonly logger;
    private readonly publicationPrice;
    constructor(paymentRepository: PaymentRepository, prisma: PrismaService, infrastructurePaymentService: InfrastructurePaymentService, configService: ConfigService);
    findAll(query: PaymentQueryDto, userId?: string, userRole?: UserRole): Promise<{
        data: PaymentResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, userId?: string, userRole?: UserRole): Promise<PaymentResponseDto>;
    verifyPayment(id: string, userId: string, userRole?: UserRole): Promise<PaymentResponseDto>;
    handleWebhook(gateway: PaymentGateway, payload: unknown, headers: Record<string, string>): Promise<void>;
    createTopUpPayment(userId: string, amount: number, method: PaymentMethod, gateway?: PaymentGateway): Promise<PaymentResponseDto>;
    createPublicationPayment(userId: string, amount: number, quantity: number, method: PaymentMethod, gateway?: PaymentGateway): Promise<PaymentResponseDto>;
    generatePaymentUrl(paymentId: string): Promise<string>;
    getBalance(userId: string): Promise<{
        balance: number;
        publicationCredits: number;
        currency: string;
    }>;
    buyPublications(userId: string, quantity: number, method: PaymentMethod, gateway?: PaymentGateway): Promise<{
        paymentId: string;
        paymentUrl?: string;
        totalAmount: number;
    }>;
    getPublicationPrice(): number;
}
