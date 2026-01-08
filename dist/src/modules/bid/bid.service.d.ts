import { BidRepository } from './repositories/bid.repository';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidQueryDto } from './dto/bid-query.dto';
import { BidResponseDto } from './dto/bid-response.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuctionRepository } from '../auction/repositories/auction.repository';
import type { Request } from 'express';
export declare class BidService {
    private readonly bidRepository;
    private readonly auctionRepository;
    private readonly prisma;
    private readonly logger;
    constructor(bidRepository: BidRepository, auctionRepository: AuctionRepository, prisma: PrismaService);
    createBid(dto: CreateBidDto, bidderId: string, request?: Request): Promise<BidResponseDto>;
    findAll(query: BidQueryDto): Promise<{
        data: BidResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<BidResponseDto>;
    retractBid(id: string, userId: string, userRole: UserRole): Promise<void>;
    getAuctionBids(auctionId: string): Promise<BidResponseDto[]>;
    getUserBids(userId: string, query: BidQueryDto): Promise<{
        data: BidResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
