import { Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../dto/api-success-response.dto';
import { PaginationMetaDto } from '../dto/pagination-meta.dto';

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
    const schema: object = {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(dataType) },
              description: 'List of items for this page',
            },
            meta: {
              type: 'object',
              required: ['pagination'],
              properties: {
                pagination: {
                  $ref: getSchemaPath(PaginationMetaDto),
                },
              },
            },
          },
        },
      ],
    };
    return ApiResponse({
      status,
      description: responseDescription,
      schema,
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

export function ApiPaginatedResponse(
  dataType: Type<unknown>,
  description?: string,
  status: number = 200,
  exampleItems?: unknown[],
) {
  const decorator = ApiSuccessResponse(status, description, dataType, true);
  if (!exampleItems || exampleItems.length === 0) {
    return decorator;
  }
  return ApiResponse({
    status,
    description: description || 'Request successful',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(dataType) },
              description: 'List of items for this page',
              example: exampleItems,
            },
            meta: {
              type: 'object',
              required: ['pagination'],
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
