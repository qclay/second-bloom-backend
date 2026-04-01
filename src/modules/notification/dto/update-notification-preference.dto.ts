import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationPreferenceDto {
  @ApiProperty({
    description: 'Enable/disable all push notifications (global toggle)',
    example: true,
  })
  @IsBoolean()
  pushEnabled!: boolean;
}
