import { ApiProperty } from '@nestjs/swagger';

export class WinnerResponseDto {
  @ApiProperty({ example: 1, description: 'Rank position (1st, 2nd, 3rd)' })
  rank!: number;

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

  @ApiProperty({ example: 50000, description: 'Highest bid amount' })
  highestBid!: number;

  @ApiProperty({ example: 5, description: 'Number of bids placed' })
  bidCount!: number;
}

export class WinnersResponseDto {
  @ApiProperty({ type: [WinnerResponseDto] })
  winners!: WinnerResponseDto[];
}
