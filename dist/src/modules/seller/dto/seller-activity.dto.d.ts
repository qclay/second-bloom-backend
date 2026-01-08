import { OrderResponseDto } from '../../order/dto/order-response.dto';
import { AuctionResponseDto } from '../../auction/dto/auction-response.dto';
export declare class SellerActivityDto {
    orders: OrderResponseDto[];
    auctions: AuctionResponseDto[];
    total: number;
}
