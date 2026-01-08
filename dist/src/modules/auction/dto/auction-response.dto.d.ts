import { Auction } from '@prisma/client';
import { ProductNestedDto } from '../../product/dto/product-nested.dto';
export declare class AuctionResponseDto {
    id: string;
    productId: string;
    creatorId: string;
    startPrice: number;
    currentPrice: number;
    bidIncrement: number;
    minBidAmount: number;
    startTime: Date;
    endTime: Date;
    durationHours: number;
    status: string;
    winnerId: string | null;
    autoExtend: boolean;
    extendMinutes: number;
    views: number;
    totalBids: number;
    version: number;
    lastBidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    product?: ProductNestedDto;
    creator?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
    };
    winner?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
    } | null;
    static fromEntity(auction: Auction & {
        product?: {
            id: string;
            title: string;
            slug: string;
            price: unknown;
            images?: Array<{
                file?: {
                    url: string;
                };
            }>;
        };
        creator?: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
        };
        winner?: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
        } | null;
    }): AuctionResponseDto;
}
