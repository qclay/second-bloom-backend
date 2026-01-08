import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
    @Optional() @Inject(MetricsService) private metricsService?: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();
    const method = request.method;
    const route = request.route?.path || request.url.split('?')[0];

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          response.setHeader('X-Response-Time', `${responseTime}ms`);

          if (this.metricsService) {
            this.metricsService.recordHttpRequest(
              method,
              route,
              statusCode,
              responseTime,
            );
          }

          if (responseTime > 1000) {
            const meta = {
              requestId: request.id,
              method,
              url: request.url,
              responseTime,
            };
            this.logger.warn(
              `Slow response detected: ${method} ${request.url} - ${responseTime}ms ${JSON.stringify(meta)}`,
            );
          }
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = (error as { status?: number }).status || 500;

          response.setHeader('X-Response-Time', `${responseTime}ms`);

          if (this.metricsService) {
            this.metricsService.recordHttpRequest(
              method,
              route,
              statusCode,
              responseTime,
            );
          }
        },
      }),
    );
  }
}
