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
import { API_MESSAGES } from '../i18n/api-messages.i18n';
import { parseAcceptLanguage, t, type Locale } from '../i18n/translation.util';

type LoggerWithMeta = WinstonLogger & {
  error: (msg: string, meta?: object) => void;
  warn: (msg: string, meta?: object) => void;
};

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

    const locale: Locale =
      parseAcceptLanguage(request.headers['accept-language']) || 'uz';

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
      message = this.getPrismaErrorMessage(exception, locale);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = t(API_MESSAGES, 'Database validation error', {}, locale);
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = t(API_MESSAGES, 'Database connection error', {}, locale);
    } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = t(API_MESSAGES, 'Database engine error', {}, locale);
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
        (this.logger as LoggerWithMeta).error('Unhandled error', {
          ...meta,
          errorMessage: exception.message,
        });
      }
    }

    const requestId = request.id;
    const userId = (request as Request & { user?: { id: string } }).user?.id;

    const errorCode =
      (exception as { code?: ErrorCode })?.code ||
      STATUS_TO_ERROR_CODE[status] ||
      ErrorCode.INTERNAL_SERVER_ERROR;

    const errorDetails: ApiErrorDetailDto[] | undefined = Array.isArray(message)
      ? message.map((msg) => ({
          message: t(API_MESSAGES, msg, {}, locale),
          code: ErrorCode.VALIDATION_FAILED,
        }))
      : undefined;

    let errorMessage = Array.isArray(message)
      ? t(API_MESSAGES, 'Validation failed', {}, locale)
      : t(API_MESSAGES, message, {}, locale);
    let finalErrorCode = errorCode;

    if (
      status >= HttpStatus.INTERNAL_SERVER_ERROR &&
      process.env.NODE_ENV === 'production'
    ) {
      errorMessage = t(
        API_MESSAGES,
        'An internal server error occurred',
        {},
        locale,
      );
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
      (this.logger as LoggerWithMeta).error('Internal server error', {
        ...meta,
        message,
      });

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
      (this.logger as LoggerWithMeta).warn('Client error', {
        context: 'AllExceptionsFilter',
        requestId,
        userId,
        method: request.method,
        url: request.url,
        status,
        message,
      });
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
      case 'P2023':
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getPrismaErrorMessage(
    error: Prisma.PrismaClientKnownRequestError,
    locale: Locale,
  ): string {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[]) || [];
        return t(
          API_MESSAGES,
          'Duplicate entry: {{target}} already exists',
          { target: target.join(', ') },
          locale,
        );
      }
      case 'P2025':
        return t(API_MESSAGES, 'Record not found', {}, locale);
      case 'P2003':
        return t(
          API_MESSAGES,
          'Invalid reference: related record does not exist',
          {},
          locale,
        );
      case 'P2014':
        return t(API_MESSAGES, 'Required relation missing', {}, locale);
      case 'P2023':
        return t(API_MESSAGES, 'Database validation error', {}, locale);
      default:
        return t(API_MESSAGES, 'Database operation failed', {}, locale);
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
    if (status === 429) {
      return {
        retryable: true,
        retryAfter: 60,
      };
    }

    if (status === 503) {
      return {
        retryable: true,
        retryAfter: 30,
      };
    }

    if (status >= 500) {
      return {
        retryable: true,
      };
    }

    return undefined;
  }
}
