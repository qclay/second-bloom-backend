import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Response } from 'express';
export declare class ThrottlerPerUserGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, unknown>): Promise<string>;
    protected getLimit(context: ExecutionContext, throttler: ThrottlerOptions): number;
    protected throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void>;
    protected addThrottlerHeaders(response: Response, throttlerLimitDetail: ThrottlerLimitDetail): void;
}
