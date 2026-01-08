import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WinstonLogger } from 'nest-winston';
import { MetricsService } from '../../metrics/metrics.service';
export declare class ResponseTimeInterceptor implements NestInterceptor {
    private readonly logger;
    private metricsService?;
    constructor(logger: WinstonLogger, metricsService?: MetricsService | undefined);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
