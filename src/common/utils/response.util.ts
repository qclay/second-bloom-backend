import { PaginationMetaDto } from '../dto/pagination-meta.dto';
import { ApiSuccessResponseDto } from '../dto/api-success-response.dto';

/**
 * Utility functions for creating standardized API responses
 * Following industry best practices
 */

/**
 * Creates pagination metadata from service response
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMetaDto {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string,
  path?: string,
  requestId?: string,
): ApiSuccessResponseDto<T> {
  return {
    success: true,
    statusCode,
    ...(message && { message }),
    data,
    timestamp: new Date().toISOString(),
    ...(path && { path }),
    ...(requestId && { requestId }),
  };
}

/**
 * Creates a standardized paginated success response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  statusCode: number = 200,
  path?: string,
  requestId?: string,
): ApiSuccessResponseDto<T[]> {
  const paginationMeta = createPaginationMeta(page, limit, total);

  return {
    success: true,
    statusCode,
    data,
    timestamp: new Date().toISOString(),
    ...(path && { path }),
    ...(requestId && { requestId }),
    meta: {
      pagination: paginationMeta,
    },
  };
}
