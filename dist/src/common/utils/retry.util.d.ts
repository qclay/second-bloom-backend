import { Logger } from '@nestjs/common';
export interface RetryOptions {
    maxAttempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (error: Error, attempt: number) => void;
}
export declare function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
export declare class CircuitBreaker {
    private readonly threshold;
    private readonly timeout;
    private readonly logger?;
    private failures;
    private lastFailureTime;
    private state;
    constructor(threshold?: number, timeout?: number, logger?: Logger | undefined);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): 'closed' | 'open' | 'half-open';
    reset(): void;
}
