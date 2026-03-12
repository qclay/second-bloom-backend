import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateFcmTokenDto {
  @ApiPropertyOptional({
    description:
      'Firebase Cloud Messaging token. Omit or pass null/empty string to clear token (e.g. on logout).',
    example: 'fGhJkLmNoPqRsTuVwXyZ1234567890',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  @MaxLength(500)
  fcmToken?: string | null;
}
