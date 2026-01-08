import { Bid } from '@prisma/client';
export declare class BidResponseDto {
    id: string;
    auctionId: string;
    bidderId: string;
    amount: number;
    isWinning: boolean;
    isRetracted: boolean;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    updatedAt: Date;
    auction?: {
        id: string;
        productId: string;
        currentPrice: number;
        status: string;
        endTime: Date;
        product?: {
            id: string;
            title: string;
            slug: string;
        };
    };
    bidder?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
    };
    static fromEntity(bid: Bid & {
        auction?: {
            id: string;
            productId: string;
            currentPrice: unknown;
            status: string;
            endTime: Date;
            product?: {
                id: string;
                title: string;
                slug: string;
            };
        };
        bidder?: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
        };
    }): BidResponseDto;
}
