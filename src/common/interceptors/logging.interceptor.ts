import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';

type LoggerWithMeta = WinstonLogger & {
  log: (msg: string, meta?: object) => void;
  warn: (msg: string, meta?: object) => void;
  error: (msg: string, meta?: object) => void;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly slowRequestThreshold: number;
  private readonly isDevelopment: boolean;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {
    this.slowRequestThreshold =
      parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '1000', 10) || 1000;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();
    const requestId = (request as Request & { id?: string }).id;
    const userId = (request as Request & { user?: { id: string } }).user?.id;

    if (this.isDevelopment) {
      (this.logger as LoggerWithMeta).log('Incoming request', {
        context: 'LoggingInterceptor',
        requestId,
        userId,
        method,
        url,
      });
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const isSlow = responseTime > this.slowRequestThreshold;

          const meta = {
            context: 'LoggingInterceptor',
            requestId,
            userId,
            method,
            url,
            responseTime,
          };

          if (isSlow) {
            (this.logger as LoggerWithMeta).warn('Slow endpoint', meta);
          } else if (this.isDevelopment) {
            (this.logger as LoggerWithMeta).log('Request completed', meta);
          }
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;
          const meta = {
            context: 'LoggingInterceptor',
            requestId,
            userId,
            method,
            url,
            responseTime,
            stack: error.stack,
          };
          
          let validationErrors;
          if (error && typeof (error as any).getResponse === 'function') {
            const response = (error as any).getResponse();
            if (response && typeof response === 'object' && response.message) {
              validationErrors = response.message;
            }
          }

          (this.logger as LoggerWithMeta).error('Request failed', {
            ...meta,
            errorMessage: error.message,
            validationErrors,
          });
        },
      }),
    );
  }
}
