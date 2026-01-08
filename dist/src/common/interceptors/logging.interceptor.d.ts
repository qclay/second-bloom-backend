import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WinstonLogger } from 'nest-winston';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    constructor(logger: WinstonLogger);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
