import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response as ExpressResponse } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiSuccessResponseDto } from '../dto/api-success-response.dto';
import { PaginationMetaDto } from '../dto/pagination-meta.dto';

/**
 * Checks if data has pagination metadata
 * Services return: { data: T[], meta: { total, page, limit, totalPages } }
 */
function hasPaginationMeta(data: unknown): data is {
  data: unknown[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const dataObj = data as Record<string, unknown>;

  if (!('meta' in dataObj) || !('data' in dataObj)) {
    return false;
  }

  if (!Array.isArray(dataObj.data)) {
    return false;
  }

  const meta = dataObj.meta;
  if (typeof meta !== 'object' || meta === null) {
    return false;
  }

  const metaObj = meta as Record<string, unknown>;
  return (
    typeof metaObj.total === 'number' &&
    typeof metaObj.page === 'number' &&
    typeof metaObj.limit === 'number' &&
    typeof metaObj.totalPages === 'number'
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponseDto<T>
> {
  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponseDto<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data: T) => {
        // Set rate limit headers
        const rateLimitLimit = response.getHeader('X-RateLimit-Limit');
        const rateLimitRemaining = response.getHeader('X-RateLimit-Remaining');
        const rateLimitReset = response.getHeader('X-RateLimit-Reset');

        if (rateLimitLimit) {
          response.setHeader('X-RateLimit-Limit', rateLimitLimit);
        }
        if (rateLimitRemaining) {
          response.setHeader('X-RateLimit-Remaining', rateLimitRemaining);
        }
        if (rateLimitReset) {
          response.setHeader('X-RateLimit-Reset', rateLimitReset);
        }

        // Extract pagination metadata if present
        let responseData: T | null = data;
        let paginationMeta: PaginationMetaDto | undefined;

        if (hasPaginationMeta(data)) {
          responseData = data.data as T;
          const serviceMeta = data.meta;
          paginationMeta = {
            page: serviceMeta.page,
            limit: serviceMeta.limit,
            total: serviceMeta.total,
            totalPages: serviceMeta.totalPages,
            hasNextPage: serviceMeta.page < serviceMeta.totalPages,
            hasPreviousPage: serviceMeta.page > 1,
          };
        }

        // Get HTTP status code
        const statusCode = response.statusCode || 200;

        // Build industry-standard success response
        return {
          success: true,
          statusCode,
          data: responseData,
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.id,
          ...(paginationMeta && {
            meta: {
              pagination: paginationMeta,
            },
          }),
        };
      }),
    );
  }
}
