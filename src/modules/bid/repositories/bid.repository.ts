import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IBidRepository } from '../interfaces/bid-repository.interface';
import { Bid, Prisma } from '@prisma/client';

@Injectable()
export class BidRepository implements IBidRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Bid | null> {
    return this.prisma.bid.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.BidCreateInput): Promise<Bid> {
    return this.prisma.bid.create({
      data,
    });
  }

  async update(id: string, data: Prisma.BidUpdateInput): Promise<Bid> {
    return this.prisma.bid.update({
      where: { id },
      data,
    });
  }

  async findMany(args: Prisma.BidFindManyArgs): Promise<Bid[]> {
    return this.prisma.bid.findMany(args);
  }

  async count(args: Prisma.BidCountArgs): Promise<number> {
    return this.prisma.bid.count(args);
  }

  async findHighestBid(auctionId: string): Promise<Bid | null> {
    return this.prisma.bid.findFirst({
      where: {
        auctionId,
        isRetracted: false,
        rejectedAt: null,
      },
      orderBy: {
        amount: 'desc',
      },
    });
  }

  async findWinningBid(auctionId: string): Promise<Bid | null> {
    return this.prisma.bid.findFirst({
      where: {
        auctionId,
        isWinning: true,
        isRetracted: false,
        rejectedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBidderBids(auctionId: string, bidderId: string): Promise<Bid[]> {
    return this.prisma.bid.findMany({
      where: {
        auctionId,
        bidderId,
        isRetracted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateWinningBids(
    auctionId: string,
    excludeBidId?: string,
  ): Promise<number> {
    const where: Prisma.BidWhereInput = {
      auctionId,
      isWinning: true,
    };

    if (excludeBidId) {
      where.id = { not: excludeBidId };
    }

    const result = await this.prisma.bid.updateMany({
      where,
      data: {
        isWinning: false,
      },
    });

    return result.count;
  }
}
