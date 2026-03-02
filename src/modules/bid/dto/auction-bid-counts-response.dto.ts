import { ApiProperty } from '@nestjs/swagger';

export class AuctionBidCountsResponseDto {
  @ApiProperty({
    description: 'Total number of bids (excluding deleted)',
    example: 293,
  })
  all!: number;

  @ApiProperty({
    description: 'Bids unread by auction owner and not rejected',
    example: 12,
  })
  new!: number;

  @ApiProperty({
    description: 'Current leading bid(s), i.e. isWinning = true',
    example: 0,
  })
  top!: number;

  @ApiProperty({
    description: 'Bids rejected by auction owner',
    example: 0,
  })
  rejected!: number;
}
