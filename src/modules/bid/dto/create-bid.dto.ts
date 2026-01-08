import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty({
    description: 'Auction ID to place bid on',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  auctionId!: string;

  @ApiProperty({
    description: 'Bid amount',
    example: 150000,
    minimum: 0.01,
    required: true,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  amount!: number;
}
