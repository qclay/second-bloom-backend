import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging token',
    example: 'fGhJkLmNoPqRsTuVwXyZ1234567890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  fcmToken!: string;
}
