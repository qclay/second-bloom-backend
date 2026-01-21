import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
@Injectable()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const pattern = host.switchToWs().getPattern();
    const userId = (client as { userId?: string }).userId || 'anonymous';

    let errorMessage = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let statusCode = 500;

    if (exception instanceof WsException) {
      const error = exception.getError();
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as { error?: string; details?: string[] };
        errorMessage = errorObj.error || errorMessage;
        if (errorObj.details) {
          errorMessage += `: ${errorObj.details.join(', ')}`;
        }
      }
      errorCode = 'WS_ERROR';
      statusCode = 400;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorCode = 'UNKNOWN_ERROR';
    }

    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
      statusCode,
      timestamp: new Date().toISOString(),
      pattern,
    };

    this.logger.error(
      `[WS Error] Pattern: ${pattern} | User: ${userId} | Socket: ${client.id} | Error: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    client.emit('error', errorResponse);
  }
}
