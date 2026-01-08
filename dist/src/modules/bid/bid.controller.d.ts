import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidQueryDto } from './dto/bid-query.dto';
import { BidResponseDto } from './dto/bid-response.dto';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';
export declare class BidController {
    private readonly bidService;
    constructor(bidService: BidService);
    create(createBidDto: CreateBidDto, userId: string, request: Request): Promise<BidResponseDto>;
    getMyBids(query: BidQueryDto, userId: string): Promise<{
        data: BidResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAuctionBids(auctionId: string): Promise<BidResponseDto[]>;
    findAll(query: BidQueryDto): Promise<{
        data: BidResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<BidResponseDto>;
    remove(id: string, userId: string, role: UserRole): Promise<void>;
}
