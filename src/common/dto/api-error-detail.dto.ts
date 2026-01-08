import { ApiProperty } from '@nestjs/swagger';

/**
 * Detailed error information following industry standards
 * Based on Stripe, Google Cloud, and JSON:API error formats
 *
 * @example
 * ```json
 * {
 *   "field": "email",
 *   "message": "Invalid email format",
 *   "code": "INVALID_FORMAT",
 *   "value": "invalid-email"
 * }
 * ```
 */
export class ApiErrorDetailDto {
  @ApiProperty({
    example: 'email',
    required: false,
    description: 'Field or parameter that caused the error',
    type: String,
  })
  field?: string;

  @ApiProperty({
    example: 'Invalid email format',
    description: 'Human-readable error message for this specific field',
    type: String,
  })
  message!: string;

  @ApiProperty({
    example: 'INVALID_FORMAT',
    description: 'Machine-readable error code for this specific error',
    type: String,
  })
  code!: string;

  @ApiProperty({
    example: 'invalid-email',
    required: false,
    description: 'The invalid value that was provided',
    type: String,
  })
  value?: unknown;
}
