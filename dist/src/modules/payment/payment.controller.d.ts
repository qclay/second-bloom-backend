import { RawBodyRequest } from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Request } from 'express';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    paymeWebhook(req: RawBodyRequest<Request>, headers: Record<string, string>): Promise<{
        ok: boolean;
    }>;
    clickWebhook(req: RawBodyRequest<Request>, headers: Record<string, string>): Promise<{
        ok: boolean;
    }>;
}
