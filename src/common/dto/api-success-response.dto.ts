import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

export class ApiSuccessResponseDto<T = unknown> {
  @ApiProperty({
    example: true,
    description: 'Indicates if the request was successful',
    type: Boolean,
  })
  success!: boolean;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
    type: Number,
    minimum: 200,
    maximum: 299,
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Resource retrieved successfully',
    required: false,
    description: 'Human-readable success message',
    type: String,
  })
  message?: string;

  @ApiProperty({
    description:
      'The response payload: array of items for list/paginated endpoints, or single object for get-by-id. Never null for list endpoints.',
    nullable: true,
    example: null,
  })
  data!: T | null;

  @ApiProperty({
    example: '2026-01-04T17:15:29.000Z',
    description: 'Response timestamp in ISO 8601 format',
    type: String,
    format: 'date-time',
  })
  timestamp!: string;

  @ApiProperty({
    example: '/api/v1/users/123',
    required: false,
    description: 'The request path',
    type: String,
  })
  path?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    description: 'Request ID for tracking and debugging',
    type: String,
    format: 'uuid',
  })
  requestId?: string;

  @ApiProperty({
    required: false,
    description: 'Pagination metadata (only present for paginated responses)',
    example: {
      pagination: {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    },
  })
  meta?: {
    pagination?: PaginationMetaDto;
    [key: string]: unknown;
  };
}
