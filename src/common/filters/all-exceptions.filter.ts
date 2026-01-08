import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { SentryService } from '../services/sentry.service';
import {
  ErrorCode,
  STATUS_TO_ERROR_CODE,
} from '../constants/error-codes.constant';
import { ApiErrorDetailDto } from '../dto/api-error-detail.dto';
import { ConfigService } from '@nestjs/config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly sentry: SentryService,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = this.handlePrismaError(exception);
      message = this.getPrismaErrorMessage(exception);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database validation error';
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection error';
    } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database engine error';
    } else if (exception instanceof Error) {
      message = exception.message;
      if (process.env.NODE_ENV !== 'development') {
        const requestId = request.id;
        const userId = (request as Request & { user?: { id: string } }).user
          ?.id;
        const meta = {
          context: 'AllExceptionsFilter',
          stack: exception.stack,
          requestId,
          userId,
          errorName: exception.name,
        };
        const errorMessage = `Unhandled error: ${exception.message} [RequestId: ${requestId}, Error: ${exception.name}]`;
        // Pass metadata as part of message to avoid splat format issues
        this.logger.error(`${errorMessage} ${JSON.stringify(meta)}`);
      }
    }

    const requestId = request.id;
    const userId = (request as Request & { user?: { id: string } }).user?.id;

    // Determine error code and type
    const errorCode =
      (exception as { code?: ErrorCode })?.code ||
      STATUS_TO_ERROR_CODE[status] ||
      ErrorCode.INTERNAL_SERVER_ERROR;

    // Build error details array for validation errors
    const errorDetails: ApiErrorDetailDto[] | undefined = Array.isArray(message)
      ? message.map((msg) => ({
          message: msg,
          code: ErrorCode.VALIDATION_FAILED,
        }))
      : undefined;

    // Prepare error message and code
    let errorMessage = Array.isArray(message) ? 'Validation failed' : message;
    let finalErrorCode = errorCode;

    // In production, sanitize error messages for 5xx errors
    if (
      status >= HttpStatus.INTERNAL_SERVER_ERROR &&
      process.env.NODE_ENV === 'production'
    ) {
      errorMessage = 'An internal server error occurred';
      finalErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    }

    const retryInfo = this.getRetryInfo(status);

    const errorResponse = {
      success: false,
      error: {
        code: finalErrorCode,
        message: errorMessage,
        ...(errorDetails &&
          errorDetails.length > 0 && { details: errorDetails }),
        ...(this.getDocumentationUrl(finalErrorCode) && {
          documentation: this.getDocumentationUrl(finalErrorCode),
        }),
      },
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      ...(retryInfo && { retry: retryInfo }),
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const meta = {
        context: 'AllExceptionsFilter',
        stack: exception instanceof Error ? exception.stack : undefined,
        requestId,
        userId,
        method: request.method,
        url: request.url,
        status,
      };
      const errorMessage = `Internal server error - ${request.method} ${request.url} - ${status} - ${message}`;
      // Pass metadata as part of message to avoid splat format issues
      this.logger.error(`${errorMessage} ${JSON.stringify(meta)}`);

      this.sentry.captureException(exception, {
        requestId,
        userId,
        extra: {
          method: request.method,
          url: request.url,
          status,
          message,
        },
      });
    } else {
      this.logger.warn(
        `Client error - ${request.method} ${request.url} - ${status} - ${message} [RequestId: ${requestId}, UserId: ${userId}]`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): number {
    switch (error.code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      case 'P2003':
        return HttpStatus.BAD_REQUEST;
      case 'P2014':
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getPrismaErrorMessage(
    error: Prisma.PrismaClientKnownRequestError,
  ): string {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[]) || [];
        return `Duplicate entry: ${target.join(', ')} already exists`;
      }
      case 'P2025':
        return 'Record not found';
      case 'P2003':
        return 'Invalid reference: related record does not exist';
      case 'P2014':
        return 'Required relation missing';
      default:
        return 'Database operation failed';
    }
  }

  private getDocumentationUrl(errorCode: ErrorCode): string | undefined {
    const baseUrl = this.configService.get<string>('API_DOCS_URL');
    if (!baseUrl) return undefined;

    return `${baseUrl}/errors/${errorCode}`;
  }

  private getRetryInfo(status: number):
    | {
        retryable: boolean;
        retryAfter?: number;
      }
    | undefined {
    // 429 Rate Limit - retryable
    if (status === 429) {
      return {
        retryable: true,
        retryAfter: 60, // seconds
      };
    }

    // 503 Service Unavailable - retryable
    if (status === 503) {
      return {
        retryable: true,
        retryAfter: 30,
      };
    }

    // 5xx errors might be retryable (except 500)
    if (status >= 500 && status !== 500) {
      return {
        retryable: true,
      };
    }

    return undefined;
  }
}
