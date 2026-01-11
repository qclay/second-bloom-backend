import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ErrorCode,
  STATUS_TO_ERROR_CODE,
} from '../constants/error-codes.constant';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, unknown>;
      if (typeof responseObj.message === 'string') {
        message = responseObj.message;
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    const errorCode =
      STATUS_TO_ERROR_CODE[status] || ErrorCode.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
      },
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.id,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
