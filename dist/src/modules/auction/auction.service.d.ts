import { AuctionRepository } from './repositories/auction.repository';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionQueryDto } from './dto/auction-query.dto';
import { AuctionResponseDto } from './dto/auction-response.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductRepository } from '../product/repositories/product.repository';
export declare class AuctionService {
    private readonly auctionRepository;
    private readonly productRepository;
    private readonly prisma;
    private readonly logger;
    constructor(auctionRepository: AuctionRepository, productRepository: ProductRepository, prisma: PrismaService);
    createAuction(dto: CreateAuctionDto, creatorId: string): Promise<AuctionResponseDto>;
    findAll(query: AuctionQueryDto): Promise<{
        data: AuctionResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, incrementViews?: boolean): Promise<AuctionResponseDto>;
    updateAuction(id: string, dto: UpdateAuctionDto, userId: string, userRole: UserRole): Promise<AuctionResponseDto>;
    deleteAuction(id: string, userId: string, userRole: UserRole): Promise<void>;
    extendAuctionIfNeeded(auctionId: string): Promise<boolean>;
    endExpiredAuctions(): Promise<number>;
    getParticipants(auctionId: string): Promise<{
        participants: Array<{
            userId: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
            avatarUrl: string | null;
            bidCount: number;
            highestBid: number;
            totalBidAmount: number;
            lastBidAt: Date | null;
        }>;
        totalParticipants: number;
    }>;
    getWinners(auctionId: string): Promise<{
        winners: Array<{
            rank: number;
            userId: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
            avatarUrl: string | null;
            highestBid: number;
            bidCount: number;
        }>;
    }>;
    getLeaderboard(auctionId: string, limit?: number): Promise<{
        leaderboard: Array<{
            rank: number;
            userId: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
            avatarUrl: string | null;
            highestBid: number;
            bidCount: number;
            totalBidAmount: number;
            lastBidAt: Date | null;
        }>;
        totalParticipants: number;
    }>;
}
