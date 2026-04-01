import { NotificationPreference } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { toISOString } from '../../../common/utils/date.util';

export class NotificationPreferenceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ description: 'Master toggle for all push notifications' })
  pushEnabled!: boolean;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  updatedAt!: string;

  static fromEntity(pref: NotificationPreference): NotificationPreferenceResponseDto {
    return {
      id: pref.id,
      userId: pref.userId,
      pushEnabled: pref.pushEnabled,
      createdAt: toISOString(pref.createdAt) ?? '',
      updatedAt: toISOString(pref.updatedAt) ?? '',
    };
  }
}
