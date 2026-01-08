import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAuctionRepository } from '../interfaces/auction-repository.interface';
import { Auction, Prisma } from '@prisma/client';

@Injectable()
export class AuctionRepository implements IAuctionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Auction | null> {
    return this.prisma.auction.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.AuctionCreateInput): Promise<Auction> {
    return this.prisma.auction.create({
      data,
    });
  }

  async update(id: string, data: Prisma.AuctionUpdateInput): Promise<Auction> {
    return this.prisma.auction.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<Auction> {
    return this.prisma.auction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        status: 'CANCELLED' as const,
      },
    });
  }

  async findMany(args: Prisma.AuctionFindManyArgs): Promise<Auction[]> {
    return this.prisma.auction.findMany(args);
  }

  async count(args: Prisma.AuctionCountArgs): Promise<number> {
    return this.prisma.auction.count(args);
  }

  async incrementViews(id: string): Promise<Auction> {
    return this.prisma.auction.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  async incrementBids(id: string): Promise<Auction> {
    return this.prisma.auction.update({
      where: { id },
      data: {
        totalBids: {
          increment: 1,
        },
      },
    });
  }

  async updateCurrentPrice(id: string, price: number): Promise<Auction> {
    return this.prisma.auction.update({
      where: { id },
      data: {
        currentPrice: price,
        lastBidAt: new Date(),
      },
    });
  }

  async findActiveEndingSoon(seconds: number): Promise<Auction[]> {
    const now = new Date();
    const threshold = new Date(now.getTime() + seconds * 1000);

    return this.prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        endTime: {
          lte: threshold,
          gte: now,
        },
        deletedAt: null,
        autoExtend: true,
      },
    });
  }
}
