import { PaginationMetaDto } from '../dto/pagination-meta.dto';
import { ApiSuccessResponseDto } from '../dto/api-success-response.dto';

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
