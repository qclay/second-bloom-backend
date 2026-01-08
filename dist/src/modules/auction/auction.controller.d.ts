import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionQueryDto } from './dto/auction-query.dto';
import { AuctionResponseDto } from './dto/auction-response.dto';
import { ParticipantsResponseDto } from './dto/participant-response.dto';
import { WinnersResponseDto } from './dto/winner-response.dto';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import { UserRole } from '@prisma/client';
export declare class AuctionController {
    private readonly auctionService;
    constructor(auctionService: AuctionService);
    create(createAuctionDto: CreateAuctionDto, userId: string): Promise<AuctionResponseDto>;
    findAll(query: AuctionQueryDto): Promise<{
        data: AuctionResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getParticipants(id: string): Promise<ParticipantsResponseDto>;
    getWinners(id: string): Promise<WinnersResponseDto>;
    getLeaderboard(id: string, limit?: string): Promise<LeaderboardResponseDto>;
    findOne(id: string, incrementViews?: string): Promise<AuctionResponseDto>;
    update(id: string, updateAuctionDto: UpdateAuctionDto, userId: string, role: UserRole): Promise<AuctionResponseDto>;
    remove(id: string, userId: string, role: UserRole): Promise<void>;
}
