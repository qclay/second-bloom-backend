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

    // Only log incoming requests in development to reduce noise
    if (this.isDevelopment) {
      const meta = {
        context: 'LoggingInterceptor',
        requestId,
        userId,
      };
      this.logger.log(
        `Incoming request - ${method} ${url} ${JSON.stringify(meta)}`,
      );
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
            this.logger.warn(
              `Slow endpoint - ${method} ${url} took ${responseTime}ms ${JSON.stringify(meta)}`,
            );
          } else if (this.isDevelopment) {
            this.logger.log(
              `Request completed - ${method} ${url} in ${responseTime}ms ${JSON.stringify(meta)}`,
            );
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

          this.logger.error(
            `Request failed - ${method} ${url}: ${error.message} ${JSON.stringify(meta)}`,
          );
        },
      }),
    );
  }
}
