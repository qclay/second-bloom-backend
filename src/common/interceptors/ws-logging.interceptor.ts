import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WsLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData();
    const pattern = context.switchToWs().getPattern();

    const userId = (client as { userId?: string }).userId || 'anonymous';
    const startTime = Date.now();

    this.logger.debug(
      `[WS] ${pattern} | User: ${userId} | Socket: ${client.id} | Data: ${JSON.stringify(data)}`,
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.debug(
          `[WS] ${pattern} | User: ${userId} | Socket: ${client.id} | Duration: ${duration}ms | Success`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `[WS] ${pattern} | User: ${userId} | Socket: ${client.id} | Duration: ${duration}ms | Error: ${error.message}`,
          error.stack,
        );
        return throwError(() => error);
      }),
    );
  }
}
