import { ApiProperty } from '@nestjs/swagger';
import { ApiErrorDetailDto } from './api-error-detail.dto';

/**
 * Standardized error response following industry best practices
 * Based on patterns from Stripe, GitHub, Google Cloud, RFC 7807, and JSON:API spec
 *
 * This DTO ensures consistent error structure across all endpoints,
 * making it easier for clients to handle errors programmatically.
 *
 * References:
 * - RFC 7807: Problem Details for HTTP APIs
 * - Stripe API: https://stripe.com/docs/api/errors
 * - GitHub API: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#client-errors
 * - Google Cloud: https://cloud.google.com/apis/design/errors
 *
 * @example
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_FAILED",
 *     "message": "Validation failed",
 *     "details": [
 *       {
 *         "field": "email",
 *         "message": "Invalid email format",
 *         "code": "INVALID_FORMAT"
 *       }
 *     ]
 *   },
 *   "statusCode": 400,
 *   "timestamp": "2026-01-04T17:15:29.000Z",
 *   "path": "/api/v1/users",
 *   "requestId": "550e8400-e29b-41d4-a716-446655440000"
 * }
 * ```
 */
/**
 * Nested error object containing error details
 * Follows RFC 7807 and industry patterns
 */
export class ApiErrorObjectDto {
  @ApiProperty({
    example: 'VALIDATION_FAILED',
    description: 'Machine-readable error code (similar to Stripe error types)',
    type: String,
  })
  code!: string;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Human-readable error message',
    type: String,
  })
  message!: string;

  @ApiProperty({
    type: [ApiErrorDetailDto],
    required: false,
    description: 'Array of detailed error information',
    isArray: true,
    example: [
      {
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_FORMAT',
      },
    ],
  })
  details?: ApiErrorDetailDto[];

  @ApiProperty({
    example: 'https://docs.example.com/errors/validation-failed',
    required: false,
    description: 'Link to error documentation',
    type: String,
    format: 'uri',
  })
  documentation?: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Indicates the request failed',
    type: Boolean,
  })
  success!: boolean;

  @ApiProperty({
    type: ApiErrorObjectDto,
    description: 'Error object containing all error details',
  })
  error!: ApiErrorObjectDto;

  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
    type: Number,
    minimum: 400,
    maximum: 599,
  })
  statusCode!: number;

  @ApiProperty({
    example: '2026-01-04T17:15:29.000Z',
    description: 'Error timestamp in ISO 8601 format',
    type: String,
    format: 'date-time',
  })
  timestamp!: string;

  @ApiProperty({
    example: '/api/v1/users',
    description: 'The request path that caused the error',
    type: String,
  })
  path!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    description: 'Request ID for tracking and debugging',
    type: String,
    format: 'uuid',
  })
  requestId?: string;
}
