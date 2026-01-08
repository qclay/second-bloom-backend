import { AuctionStatus } from '@prisma/client';
export declare class AuctionQueryDto {
    productId?: string;
    creatorId?: string;
    status?: AuctionStatus;
    active?: boolean;
    endingBefore?: string;
    endingAfter?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
