import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toISOString } from '../../../common/utils/date.util';

type BlockedUserEntity = {
  createdAt: Date;
  blocked: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneCountryCode: string | null;
    phoneNumber: string;
    avatar: { url: string } | null;
  };
};

export class BlockedUserResponseDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  id!: string;

  @ApiPropertyOptional({ example: 'johndoe' })
  username!: string | null;

  @ApiPropertyOptional({ example: 'John' })
  firstName!: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName!: string | null;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  avatarUrl!: string | null;

  @ApiProperty({ example: '2026-04-20T11:00:00.000Z' })
  blockedAt!: string;

  static fromEntity(entity: BlockedUserEntity): BlockedUserResponseDto {
    const phoneNumber = entity.blocked.phoneCountryCode
      ? `${entity.blocked.phoneCountryCode}${entity.blocked.phoneNumber}`
      : entity.blocked.phoneNumber;

    return {
      id: entity.blocked.id,
      username: entity.blocked.username,
      firstName: entity.blocked.firstName,
      lastName: entity.blocked.lastName,
      phoneNumber,
      avatarUrl: entity.blocked.avatar?.url ?? null,
      blockedAt: toISOString(entity.createdAt) ?? '',
    };
  }
}
