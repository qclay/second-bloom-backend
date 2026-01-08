import { PrismaService } from '../../../prisma/prisma.service';
import { IBidRepository } from '../interfaces/bid-repository.interface';
import { Bid, Prisma } from '@prisma/client';
export declare class BidRepository implements IBidRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Bid | null>;
    create(data: Prisma.BidCreateInput): Promise<Bid>;
    update(id: string, data: Prisma.BidUpdateInput): Promise<Bid>;
    findMany(args: Prisma.BidFindManyArgs): Promise<Bid[]>;
    count(args: Prisma.BidCountArgs): Promise<number>;
    findHighestBid(auctionId: string): Promise<Bid | null>;
    findWinningBid(auctionId: string): Promise<Bid | null>;
    findBidderBids(auctionId: string, bidderId: string): Promise<Bid[]>;
    updateWinningBids(auctionId: string, excludeBidId?: string): Promise<number>;
}
