import { ConfigService } from '@nestjs/config';
import { IPaymentStrategy } from './payment-strategy.interface';
export declare class ClickStrategy implements IPaymentStrategy {
    private readonly configService;
    private readonly logger;
    private readonly merchantId;
    private readonly serviceId;
    private readonly secretKey;
    private readonly baseUrl;
    private readonly circuitBreaker;
    constructor(configService: ConfigService);
    private generateSign;
    initiatePayment(amount: number, orderId: string, transactionId: string): Promise<{
        transactionId: string;
        redirectUrl?: string;
        paymentUrl?: string;
        gatewayTransactionId?: string;
        gatewayOrderId?: string;
    }>;
    verifyPayment(gatewayTransactionId: string, transactionId: string): Promise<{
        success: boolean;
        status: 'COMPLETED' | 'FAILED' | 'PENDING';
        gatewayTransactionId?: string;
    }>;
    refundPayment(gatewayTransactionId: string, amount: number, transactionId: string): Promise<{
        success: boolean;
        refundTransactionId?: string;
    }>;
    verifyWebhook(payload: unknown, _headers: Record<string, string>): boolean;
    processWebhook(payload: unknown): Promise<{
        transactionId: string;
        status: 'COMPLETED' | 'FAILED' | 'PENDING';
        gatewayTransactionId?: string;
        amount?: number;
    }>;
}
