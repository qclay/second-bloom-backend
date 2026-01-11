import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error-codes.constant';
import { ApiErrorDetailDto } from '../dto/api-error-detail.dto';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse() as ExceptionResponse;

    let message = 'Validation failed';
    const errorDetails: ApiErrorDetailDto[] = [];

    if (
      exceptionResponse?.message &&
      Array.isArray(exceptionResponse.message)
    ) {
      this.formatValidationErrors(exceptionResponse.message, errorDetails);
    } else if (exceptionResponse?.message) {
      message = String(exceptionResponse.message);
    }

    const errorResponse = {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_FAILED,
        message,
        ...(errorDetails.length > 0 && { details: errorDetails }),
      },
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.id,
    };

    this.logger.warn(
      `${request.method} ${request.url} - Validation Error: ${message}`,
    );

    response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
  }

  private formatValidationErrors(
    messages: string[],
    errorDetails: ApiErrorDetailDto[],
  ): void {
    messages.forEach((message) => {
      const fieldMatch = message.match(/^(\w+)\s/);
      const field = fieldMatch ? fieldMatch[1] : undefined;

      errorDetails.push({
        ...(field && { field }),
        message,
        code: ErrorCode.VALIDATION_FAILED,
      });
    });
  }
}
