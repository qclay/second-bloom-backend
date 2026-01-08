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
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    this.logger.log(
      `Incoming request - ${method} ${url}`,
      'LoggingInterceptor',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          const isSlow = responseTime > 1000;

          if (isSlow) {
            this.logger.warn(
              `Slow endpoint - ${method} ${url} took ${responseTime}ms`,
              'LoggingInterceptor',
            );
          } else {
            this.logger.log(
              `Request completed - ${method} ${url} in ${responseTime}ms`,
              'LoggingInterceptor',
            );
          }
        },
        error: (error: Error) => {
          const requestId = request.id;
          const userId = (request as Request & { user?: { id: string } }).user
            ?.id;
          const meta = {
            context: 'LoggingInterceptor',
            stack: error.stack,
            requestId,
            userId,
            method,
            url,
          };
          const errorMessage = `Request failed - ${method} ${url}: ${error.message}`;
          this.logger.error(`${errorMessage} ${JSON.stringify(meta)}`);
        },
      }),
    );
  }
}
