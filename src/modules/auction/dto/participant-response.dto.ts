import { ApiProperty } from '@nestjs/swagger';

export class ParticipantResponseDto {
  @ApiProperty({ example: 'clx1234567890abcdef' })
  userId!: string;

  @ApiProperty({ example: 'John', nullable: true })
  firstName!: string | null;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName!: string | null;

  @ApiProperty({ example: '+998901234567' })
  phoneNumber!: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({
    example: 5,
    description: 'Number of bids placed by this user',
  })
  bidCount!: number;

  @ApiProperty({ example: 50000, description: 'Highest bid amount' })
  highestBid!: number;

  @ApiProperty({ example: 150000, description: 'Total amount of all bids' })
  totalBidAmount!: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', nullable: true })
  lastBidAt!: Date | null;
}

export class ParticipantsResponseDto {
  @ApiProperty({ type: [ParticipantResponseDto] })
  participants!: ParticipantResponseDto[];

  @ApiProperty({ example: 10, description: 'Total number of participants' })
  totalParticipants!: number;
}
