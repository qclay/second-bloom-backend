import { Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../dto/api-success-response.dto';
import { PaginationMetaDto } from '../dto/pagination-meta.dto';

/**
 * Decorator to add standardized success response to Swagger documentation
 * Automatically wraps the response in ApiSuccessResponseDto format
 *
 * @param status - HTTP status code (default: 200)
 * @param description - Response description
 * @param dataType - The type of data in the response (optional)
 * @param isPaginated - Whether this is a paginated response
 * @example
 * ```typescript
 * @ApiSuccessResponse()
 * @ApiSuccessResponse(201, 'User created successfully', UserResponseDto)
 * @ApiSuccessResponse(200, 'List of users', UserResponseDto, true)
 * ```
 */
export function ApiSuccessResponse(
  status: number = 200,
  description?: string,
  dataType?: Type<unknown>,
  isPaginated: boolean = false,
) {
  const defaultDescriptions: Record<number, string> = {
    200: 'Request successful',
    201: 'Resource created successfully',
    204: 'Request processed successfully',
  };

  const responseDescription =
    description || defaultDescriptions[status] || 'Request successful';

  if (isPaginated && dataType) {
    return ApiResponse({
      status,
      description: responseDescription,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataType) },
              },
              meta: {
                type: 'object',
                properties: {
                  pagination: {
                    $ref: getSchemaPath(PaginationMetaDto),
                  },
                },
              },
            },
          },
        ],
      },
    });
  }

  if (dataType) {
    return ApiResponse({
      status,
      description: responseDescription,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessResponseDto) },
          {
            properties: {
              data: {
                oneOf: [
                  { $ref: getSchemaPath(dataType) },
                  { type: 'array', items: { $ref: getSchemaPath(dataType) } },
                ],
              },
            },
          },
        ],
      },
    });
  }

  return ApiResponse({
    status,
    description: responseDescription,
    type: ApiSuccessResponseDto,
  });
}

/**
 * Decorator for paginated responses
 * Shorthand for ApiSuccessResponse with isPaginated=true
 *
 * @param status - HTTP status code (default: 200)
 * @param description - Response description
 * @param dataType - The type of items in the paginated array
 * @example
 * ```typescript
 * @ApiPaginatedResponse(UserResponseDto, 'List of users')
 * ```
 */
export function ApiPaginatedResponse(
  dataType: Type<unknown>,
  description?: string,
  status: number = 200,
) {
  return ApiSuccessResponse(status, description, dataType, true);
}
