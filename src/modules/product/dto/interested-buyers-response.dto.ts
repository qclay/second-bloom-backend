import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InterestedBuyerDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId!: string;

  @ApiPropertyOptional({ example: 'Ali' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Karimov' })
  lastName?: string | null;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  avatarUrl?: string | null;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  conversationId!: string;

  @ApiProperty({ example: '2026-04-27T09:10:11.000Z' })
  lastMessageAt!: string;

  @ApiProperty({ example: true })
  isOnline!: boolean;
}

export class InterestedBuyersResponseDto {
  @ApiProperty({ type: [InterestedBuyerDto] })
  data!: InterestedBuyerDto[];

  @ApiProperty({ example: 3 })
  total!: number;
}
