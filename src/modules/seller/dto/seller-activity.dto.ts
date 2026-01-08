import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from '../../order/dto/order-response.dto';
import { AuctionResponseDto } from '../../auction/dto/auction-response.dto';

export class SellerActivityDto {
  @ApiProperty({ type: [OrderResponseDto], description: 'List of orders' })
  orders!: OrderResponseDto[];

  @ApiProperty({ type: [AuctionResponseDto], description: 'List of auctions' })
  auctions!: AuctionResponseDto[];

  @ApiProperty({ example: 25, description: 'Total count of activities' })
  total!: number;
}
