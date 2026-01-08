import { PrismaService } from '../../prisma/prisma.service';
import { BuyPublicationsDto } from './dto/buy-publications.dto';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { PaymentService } from '../payment/payment.service';
import { ConfigService } from '@nestjs/config';
export declare class WalletService {
    private readonly prisma;
    private readonly paymentService;
    private readonly configService;
    private readonly logger;
    private readonly publicationPrice;
    constructor(prisma: PrismaService, paymentService: PaymentService, configService: ConfigService);
    getBalance(userId: string): Promise<WalletResponseDto>;
    getTransactions(userId: string, page?: number, limit?: number): Promise<{
        data: Array<{
            id: string;
            paymentType: string;
            amount: number;
            quantity: number;
            status: string;
            method: string;
            gateway: string | null;
            createdAt: Date;
            paidAt: Date | null;
        }>;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    buyPublications(userId: string, dto: BuyPublicationsDto): Promise<{
        paymentId: string;
        paymentUrl?: string;
        totalAmount: number;
    }>;
    usePublicationCredit(userId: string, productId: string): Promise<void>;
    getTransactionById(transactionId: string, userId: string): Promise<{
        id: string;
        paymentType: string;
        amount: number;
        quantity: number;
        status: string;
        method: string;
        gateway: string | null;
        transactionId: string | null;
        gatewayTransactionId: string | null;
        gatewayOrderId: string | null;
        createdAt: Date;
        paidAt: Date | null;
        refundedAt: Date | null;
    }>;
    verifyTransaction(transactionId: string, userId: string): Promise<{
        id: string;
        paymentType: string;
        amount: number;
        quantity: number;
        status: string;
        method: string;
        gateway: string | null;
        createdAt: Date;
        paidAt: Date | null;
    }>;
    refundTransaction(transactionId: string, userId: string, reason?: string): Promise<{
        id: string;
        paymentType: string;
        amount: number;
        quantity: number;
        status: string;
        method: string;
        gateway: string | null;
        createdAt: Date;
        paidAt: Date | null;
    }>;
    getPublicationPrice(): number;
}
