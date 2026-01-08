import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';

/**
 * Decorator to add common error responses to Swagger documentation
 * Following industry best practices from Stripe, GitHub, Google Cloud APIs
 *
 * @param options - Configuration for which error responses to include
 * @example
 * ```typescript
 * @ApiCommonErrorResponses()
 * @ApiCommonErrorResponses({ unauthorized: false })
 * @ApiCommonErrorResponses({ badRequest: true, notFound: true })
 * ```
 */
export function ApiCommonErrorResponses(options?: {
  badRequest?: boolean;
  unauthorized?: boolean;
  forbidden?: boolean;
  notFound?: boolean;
  conflict?: boolean;
  internalServerError?: boolean;
}) {
  const {
    badRequest = true,
    unauthorized = true,
    forbidden = true,
    notFound = true,
    conflict = false,
    internalServerError = true,
  } = options || {};

  const decorators = [];

  if (badRequest) {
    decorators.push(
      ApiResponse({
        status: 400,
        description: 'Bad Request - Invalid input data or validation failed',
        type: ApiErrorResponseDto,
      }),
    );
  }

  if (unauthorized) {
    decorators.push(
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication required or token invalid',
        type: ApiErrorResponseDto,
      }),
    );
  }

  if (forbidden) {
    decorators.push(
      ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
        type: ApiErrorResponseDto,
      }),
    );
  }

  if (notFound) {
    decorators.push(
      ApiResponse({
        status: 404,
        description: 'Not Found - Resource does not exist',
        type: ApiErrorResponseDto,
      }),
    );
  }

  if (conflict) {
    decorators.push(
      ApiResponse({
        status: 409,
        description: 'Conflict - Resource already exists or state conflict',
        type: ApiErrorResponseDto,
      }),
    );
  }

  if (internalServerError) {
    decorators.push(
      ApiResponse({
        status: 500,
        description: 'Internal Server Error - Unexpected server error',
        type: ApiErrorResponseDto,
      }),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Decorator for authenticated endpoints (adds 401 and 403)
 */
export function ApiAuthErrorResponses() {
  return ApiCommonErrorResponses({
    badRequest: false,
    unauthorized: true,
    forbidden: true,
    notFound: false,
    conflict: false,
    internalServerError: false,
  });
}

/**
 * Decorator for public endpoints (adds 400 and 404)
 */
export function ApiPublicErrorResponses() {
  return ApiCommonErrorResponses({
    badRequest: true,
    unauthorized: false,
    forbidden: false,
    notFound: true,
    conflict: false,
    internalServerError: false,
  });
}
