"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
exports.retry = retry;
async function retry(fn, options = {}) {
    const { maxAttempts = 3, delay = 1000, backoff = 'exponential', onRetry, } = options;
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxAttempts) {
                throw lastError;
            }
            if (onRetry) {
                onRetry(lastError, attempt);
            }
            const waitTime = backoff === 'exponential'
                ? delay * Math.pow(2, attempt - 1)
                : delay * attempt;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    }
    throw lastError || new Error('Retry failed');
}
class CircuitBreaker {
    threshold;
    timeout;
    logger;
    failures = 0;
    lastFailureTime = 0;
    state = 'closed';
    constructor(threshold = 5, timeout = 60000, logger) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.logger = logger;
    }
    async execute(fn) {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'half-open';
                this.logger?.log('Circuit breaker: transitioning to half-open');
            }
            else {
                throw new Error('Circuit breaker is open');
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failures = 0;
        if (this.state === 'half-open') {
            this.state = 'closed';
            this.logger?.log('Circuit breaker: closed after successful call');
        }
    }
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.threshold) {
            this.state = 'open';
            this.logger?.warn(`Circuit breaker: opened after ${this.failures} failures`);
        }
    }
    getState() {
        return this.state;
    }
    reset() {
        this.failures = 0;
        this.state = 'closed';
        this.lastFailureTime = 0;
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=retry.util.js.map