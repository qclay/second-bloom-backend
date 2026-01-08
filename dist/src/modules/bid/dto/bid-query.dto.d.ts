export declare class BidQueryDto {
    auctionId?: string;
    bidderId?: string;
    isWinning?: boolean;
    isRetracted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
