import { Auction, Prisma } from '@prisma/client';

export interface IAuctionRepository {
  findById(id: string): Promise<Auction | null>;
  create(data: Prisma.AuctionCreateInput): Promise<Auction>;
  update(id: string, data: Prisma.AuctionUpdateInput): Promise<Auction>;
  softDelete(id: string, deletedBy: string): Promise<Auction>;
  findMany(args: Prisma.AuctionFindManyArgs): Promise<Auction[]>;
  count(args: Prisma.AuctionCountArgs): Promise<number>;
  incrementViews(id: string): Promise<Auction>;
  incrementBids(id: string): Promise<Auction>;
  updateCurrentPrice(id: string, price: number): Promise<Auction>;
  findActiveEndingSoon(seconds: number): Promise<Auction[]>;
}
