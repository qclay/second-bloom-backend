import { applyDecorators } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';

const ERROR_EXAMPLES: Record<number, object> = {
  400: {
    success: false,
    error: {
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      details: [{ field: 'fcmToken', message: 'fcmToken must be a string', code: 'INVALID_FORMAT' }],
    },
    statusCode: 400,
    timestamp: new Date().toISOString(),
    path: '/api/v1/users/fcm-token',
    requestId: '550e8400-e29b-41d4-a716-446655440000',
  },
  401: {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    },
    statusCode: 401,
    timestamp: new Date().toISOString(),
    path: '/api/v1/users/fcm-token',
    requestId: '550e8400-e29b-41d4-a716-446655440001',
  },
  403: {
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Insufficient permissions',
    },
    statusCode: 403,
    timestamp: new Date().toISOString(),
    path: '/api/v1/users/fcm-token',
    requestId: '550e8400-e29b-41d4-a716-446655440002',
  },
  404: {
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'User not found',
    },
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: '/api/v1/users/unknown-id',
    requestId: '550e8400-e29b-41d4-a716-446655440003',
  },
  409: {
    success: false,
    error: {
      code: 'RESOURCE_CONFLICT',
      message: 'User with this phone number already exists',
    },
    statusCode: 409,
    timestamp: new Date().toISOString(),
    path: '/api/v1/users',
    requestId: '550e8400-e29b-41d4-a716-446655440004',
  },
  500: {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: '/api/v1/users/fcm-token',
    requestId: '550e8400-e29b-41d4-a716-446655440005',
  },
};

function errorResponse(
  status: 400 | 401 | 403 | 404 | 409 | 500,
  description: string,
) {
  return ApiResponse({
    status,
    description,
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ApiErrorResponseDto) },
        example: ERROR_EXAMPLES[status],
      },
    },
  });
}

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
      errorResponse(
        400,
        'Bad Request - Invalid input data or validation failed',
      ),
    );
  }

  if (unauthorized) {
    decorators.push(
      errorResponse(
        401,
        'Unauthorized - Authentication required or token invalid',
      ),
    );
  }

  if (forbidden) {
    decorators.push(
      errorResponse(
        403,
        'Forbidden - Insufficient permissions',
      ),
    );
  }

  if (notFound) {
    decorators.push(
      errorResponse(404, 'Not Found - Resource does not exist'),
    );
  }

  if (conflict) {
    decorators.push(
      errorResponse(
        409,
        'Conflict - Resource already exists or state conflict',
      ),
    );
  }

  if (internalServerError) {
    decorators.push(
      errorResponse(
        500,
        'Internal Server Error - Unexpected server error',
      ),
    );
  }

  return applyDecorators(...decorators);
}

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
