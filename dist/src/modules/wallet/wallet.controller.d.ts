import { PaymentService } from '../payment/payment.service';
import { BuyPublicationsDto } from './dto/buy-publications.dto';
export declare class WalletController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    getBalance(userId: string): Promise<{
        balance: number;
        publicationCredits: number;
        currency: string;
    }>;
    buyPublications(buyPublicationsDto: BuyPublicationsDto, userId: string): Promise<{
        paymentId: string;
        paymentUrl?: string;
        totalAmount: number;
    }>;
    getTransactions(userId: string, page?: string, limit?: string): Promise<{
        data: import("../payment/dto/payment-response.dto").PaymentResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPublicationPrice(): {
        price: any;
        currency: string;
    };
    getTransaction(id: string, userId: string): Promise<any>;
    verifyTransaction(id: string, userId: string): Promise<any>;
}
