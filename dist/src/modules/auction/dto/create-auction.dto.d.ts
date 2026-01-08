export declare class CreateAuctionDto {
    productId: string;
    startPrice: number;
    bidIncrement?: number;
    minBidAmount?: number;
    endTime?: string;
    durationHours?: number;
    autoExtend?: boolean;
    extendMinutes?: number;
}
