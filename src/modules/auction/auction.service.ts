import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { AuctionRepository } from './repositories/auction.repository';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionQueryDto } from './dto/auction-query.dto';
import { AuctionResponseDto } from './dto/auction-response.dto';
import { Prisma, AuctionStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductRepository } from '../product/repositories/product.repository';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AuctionService {
  private readonly logger = new Logger(AuctionService.name);

  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createAuction(
    dto: CreateAuctionDto,
    creatorId: string,
  ): Promise<AuctionResponseDto> {
    this.logger.log(`Creating auction for product ${dto.productId}`);
    const product = await this.productRepository.findById(dto.productId);

    if (!product) {
      this.logger.warn(
        `Product not found: ${dto.productId} (creatorId: ${creatorId})`,
      );
      throw new NotFoundException('Product not found');
    }

    if (product.deletedAt) {
      this.logger.warn(
        `Product is soft-deleted: ${dto.productId} (deletedAt: ${product.deletedAt.toISOString()})`,
      );
      throw new NotFoundException('Product not found');
    }

    if (product.sellerId !== creatorId) {
      throw new ForbiddenException(
        'You can only create auctions for your own products',
      );
    }

    if (product.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Product must be active to create an auction',
      );
    }

    const now = new Date();
    const endTime = dto.endTime
      ? new Date(dto.endTime)
      : new Date(now.getTime() + (dto.durationHours ?? 2) * 60 * 60 * 1000);

    if (endTime <= now) {
      throw new BadRequestException('End time must be in the future');
    }

    if (dto.minBidAmount === undefined) {
      dto.minBidAmount = dto.startPrice;
    }

    if (dto.minBidAmount > dto.startPrice) {
      throw new BadRequestException(
        'Minimum bid amount cannot be greater than start price',
      );
    }

    const auction = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existingActiveAuction = await tx.auction.findFirst({
          where: {
            productId: dto.productId,
            status: 'ACTIVE',
            deletedAt: null,
          },
        });

        if (existingActiveAuction) {
          throw new ConflictException('Product already has an active auction');
        }

        return tx.auction.create({
          data: {
            product: {
              connect: { id: dto.productId },
            },
            creator: {
              connect: { id: creatorId },
            },
            startPrice: dto.startPrice,
            currentPrice: dto.startPrice,
            bidIncrement: dto.bidIncrement ?? 1000,
            minBidAmount:
              dto.minBidAmount !== undefined
                ? dto.minBidAmount
                : dto.startPrice,
            startTime: now,
            endTime,
            durationHours: dto.durationHours ?? 2,
            status: AuctionStatus.ACTIVE,
            autoExtend: dto.autoExtend ?? true,
            extendMinutes: dto.extendMinutes ?? 5,
          },
        });
      },
    );

    this.logger.log(
      `Auction created: ${auction.id} for product ${dto.productId}`,
    );
    return this.findById(auction.id);
  }

  async findAll(query: AuctionQueryDto) {
    const {
      page = 1,
      limit = 20,
      productId,
      creatorId,
      status,
      active,
      endingBefore,
      endingAfter,
      sortBy = 'endTime',
      sortOrder = 'asc',
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.AuctionWhereInput = {
      deletedAt: null,
    };

    if (productId) {
      where.productId = productId;
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    if (active === true) {
      where.status = 'ACTIVE';
      where.endTime = { gte: new Date() };
    } else if (active === false) {
      where.OR = [
        { status: { not: 'ACTIVE' } },
        { endTime: { lt: new Date() } },
      ];
    } else if (status) {
      where.status = status;
    }

    if (endingBefore || endingAfter) {
      where.endTime = {};
      if (endingBefore) {
        where.endTime.lte = new Date(endingBefore);
      }
      if (endingAfter) {
        where.endTime.gte = new Date(endingAfter);
      }
    }

    const orderBy: Prisma.AuctionOrderByWithRelationInput = {};
    if (sortBy === 'endTime') {
      orderBy.endTime = sortOrder;
    } else if (sortBy === 'currentPrice') {
      orderBy.currentPrice = sortOrder;
    } else if (sortBy === 'totalBids') {
      orderBy.totalBids = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.endTime = 'asc';
    }

    const [auctions, total] = await Promise.all([
      this.auctionRepository.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              images: {
                include: {
                  file: {
                    select: {
                      url: true,
                    },
                  },
                },
                orderBy: { displayOrder: 'asc' },
                take: 1,
              },
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          winner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      }),
      this.auctionRepository.count({ where }),
    ]);

    return {
      data: auctions.map((auction) => AuctionResponseDto.fromEntity(auction)),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async findById(
    id: string,
    incrementViews = false,
  ): Promise<AuctionResponseDto> {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: {
              include: {
                file: {
                  select: {
                    url: true,
                  },
                },
              },
              orderBy: { displayOrder: 'asc' },
              take: 5,
            },
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        winner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    if (auction.deletedAt) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    if (incrementViews) {
      await this.auctionRepository.incrementViews(id);
    }

    return AuctionResponseDto.fromEntity(auction);
  }

  async updateAuction(
    id: string,
    dto: UpdateAuctionDto,
    userId: string,
    userRole: UserRole,
  ): Promise<AuctionResponseDto> {
    const auction = await this.auctionRepository.findById(id);

    if (!auction || auction.deletedAt) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    if (auction.creatorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own auctions');
    }

    if (auction.status !== 'ACTIVE' && dto.status !== 'CANCELLED') {
      throw new BadRequestException(
        'Can only update active auctions or cancel them',
      );
    }

    const updateData: Prisma.AuctionUpdateInput = {};

    if (dto.endTime !== undefined) {
      const endTime = new Date(dto.endTime);
      if (endTime <= new Date()) {
        throw new BadRequestException('End time must be in the future');
      }
      updateData.endTime = endTime;
    }

    if (dto.startPrice !== undefined) {
      if (auction.totalBids > 0) {
        throw new BadRequestException(
          'Cannot change start price after bids have been placed',
        );
      }
      updateData.startPrice = dto.startPrice;
      updateData.currentPrice = dto.startPrice;
    }

    if (dto.bidIncrement !== undefined) {
      updateData.bidIncrement = dto.bidIncrement;
    }

    if (dto.minBidAmount !== undefined) {
      if (dto.minBidAmount > (dto.startPrice ?? Number(auction.startPrice))) {
        throw new BadRequestException(
          'Minimum bid amount cannot be greater than start price',
        );
      }
      updateData.minBidAmount = dto.minBidAmount;
    }

    if (dto.durationHours !== undefined) {
      updateData.durationHours = dto.durationHours;
    }

    if (dto.autoExtend !== undefined) {
      updateData.autoExtend = dto.autoExtend;
    }

    if (dto.extendMinutes !== undefined) {
      updateData.extendMinutes = dto.extendMinutes;
    }

    if (dto.status !== undefined) {
      if (dto.status === 'CANCELLED' && auction.totalBids > 0) {
        throw new BadRequestException(
          'Cannot cancel auction with existing bids',
        );
      }
      updateData.status = dto.status;
      if (dto.status === 'CANCELLED') {
        updateData.deletedAt = new Date();
        updateData.deletedBy = userId;
      }
    }

    await this.auctionRepository.update(id, updateData);
    return this.findById(id);
  }

  async deleteAuction(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const auction = await this.auctionRepository.findById(id);

    if (!auction || auction.deletedAt) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    if (auction.creatorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own auctions');
    }

    if (auction.totalBids > 0) {
      throw new BadRequestException('Cannot delete auction with existing bids');
    }

    await this.auctionRepository.softDelete(id, userId);
  }

  async extendAuctionIfNeeded(auctionId: string): Promise<boolean> {
    try {
      const auction = await this.auctionRepository.findById(auctionId);

      if (!auction || auction.status !== 'ACTIVE' || !auction.autoExtend) {
        return false;
      }

      const now = new Date();
      const timeUntilEnd = auction.endTime.getTime() - now.getTime();
      const extendThreshold = auction.extendMinutes * 60 * 1000;

      if (timeUntilEnd > 0 && timeUntilEnd <= extendThreshold) {
        const newEndTime = new Date(
          now.getTime() + auction.extendMinutes * 60 * 1000,
        );

        const updated = await this.prisma.auction.updateMany({
          where: {
            id: auctionId,
            version: auction.version,
          },
          data: {
            endTime: newEndTime,
            version: {
              increment: 1,
            },
          },
        });

        if (updated.count > 0) {
          this.logger.log(
            `Auction ${auctionId} extended until ${newEndTime.toISOString()}`,
          );
          return true;
        }

        this.logger.warn(
          `Failed to extend auction ${auctionId}: version mismatch (optimistic locking)`,
        );
        return false;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Error extending auction ${auctionId}`,
        error instanceof Error ? error.stack : error,
      );
      return false;
    }
  }

  async endExpiredAuctions(): Promise<number> {
    try {
      const now = new Date();
      const expiredAuctions = await this.prisma.auction.findMany({
        where: {
          status: 'ACTIVE',
          endTime: { lte: now },
          deletedAt: null,
        },
        include: {
          bids: {
            where: {
              isWinning: true,
              isRetracted: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        take: 100,
      });

      let endedCount = 0;
      const errors: Array<{ auctionId: string; error: string }> = [];

      for (const auction of expiredAuctions) {
        try {
          await this.prisma.$transaction(
            async (tx: Prisma.TransactionClient) => {
              const winningBid = auction.bids[0];

              await tx.auction.update({
                where: { id: auction.id },
                data: {
                  status: 'ENDED',
                  winnerId: winningBid?.bidderId ?? null,
                },
              });

              if (winningBid) {
                await tx.bid.updateMany({
                  where: {
                    auctionId: auction.id,
                    id: { not: winningBid.id },
                    isWinning: true,
                  },
                  data: {
                    isWinning: false,
                  },
                });
              }
            },
          );

          endedCount++;
          this.logger.log(
            `Auction ${auction.id} ended. Winner: ${auction.bids[0]?.bidderId ?? 'none'}`,
          );

          try {
            const product = await this.prisma.product.findUnique({
              where: { id: auction.productId },
              select: { title: true },
            });

            const participants = await this.prisma.bid.findMany({
              where: {
                auctionId: auction.id,
                isRetracted: false,
              },
              select: {
                bidderId: true,
              },
              distinct: ['bidderId'],
            });

            const winnerId = auction.bids[0]?.bidderId ?? null;

            await Promise.all(
              participants.map((p) =>
                this.notificationService.notifyAuctionEndedForParticipant({
                  userId: p.bidderId,
                  auctionId: auction.id,
                  productId: auction.productId,
                  productTitle: product?.title,
                  isWinner: winnerId !== null && p.bidderId === winnerId,
                }),
              ),
            );
          } catch (error) {
            this.logger.error(
              `Failed to send AUCTION_ENDED notifications for auction ${auction.id}`,
              error instanceof Error ? error.stack : error,
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push({ auctionId: auction.id, error: errorMessage });
          this.logger.error(
            `Failed to end auction ${auction.id}`,
            error instanceof Error ? error.stack : error,
          );
        }
      }

      if (errors.length > 0) {
        this.logger.warn(
          `Failed to end ${errors.length} auctions: ${JSON.stringify(errors)}`,
        );
      }

      return endedCount;
    } catch (error) {
      this.logger.error(
        'Error in endExpiredAuctions batch job',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async getParticipants(auctionId: string): Promise<{
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
  }> {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }

    const participantsData = await this.prisma.$queryRaw<
      Array<{
        userId: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
        avatarUrl: string | null;
        bidCount: bigint;
        highestBid: unknown;
        totalBidAmount: unknown;
        lastBidAt: Date | null;
      }>
    >`
      SELECT
        u.id as "userId",
        u."firstName" as "firstName",
        u."lastName" as "lastName",
        u."phoneNumber" as "phoneNumber",
        f.url as "avatarUrl",
        COUNT(b.id)::bigint as "bidCount",
        MAX(b.amount) as "highestBid",
        SUM(b.amount) as "totalBidAmount",
        MAX(b."createdAt") as "lastBidAt"
      FROM bids b
      INNER JOIN users u ON b."bidderId" = u.id
      LEFT JOIN files f ON u."avatarId" = f.id
      WHERE b."auctionId" = ${auctionId}
        AND b."isRetracted" = false
        AND u."deletedAt" IS NULL
      GROUP BY u.id, u."firstName", u."lastName", u."phoneNumber", f.url
      ORDER BY MAX(b.amount) DESC, COUNT(b.id) DESC
    `;

    const participants = participantsData.map((p) => ({
      userId: p.userId,
      firstName: p.firstName,
      lastName: p.lastName,
      phoneNumber: p.phoneNumber,
      avatarUrl: p.avatarUrl,
      bidCount: Number(p.bidCount),
      highestBid:
        typeof p.highestBid === 'number'
          ? p.highestBid
          : Number(p.highestBid) || 0,
      totalBidAmount:
        typeof p.totalBidAmount === 'number'
          ? p.totalBidAmount
          : Number(p.totalBidAmount) || 0,
      lastBidAt: p.lastBidAt,
    }));

    return {
      participants,
      totalParticipants: participants.length,
    };
  }

  async getWinners(auctionId: string): Promise<{
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
  }> {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }

    const winnersData = await this.prisma.$queryRaw<
      Array<{
        userId: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
        avatarUrl: string | null;
        highestBid: unknown;
        bidCount: bigint;
      }>
    >`
      SELECT
        u.id as "userId",
        u."firstName" as "firstName",
        u."lastName" as "lastName",
        u."phoneNumber" as "phoneNumber",
        f.url as "avatarUrl",
        MAX(b.amount) as "highestBid",
        COUNT(b.id)::bigint as "bidCount"
      FROM bids b
      INNER JOIN users u ON b."bidderId" = u.id
      LEFT JOIN files f ON u."avatarId" = f.id
      WHERE b."auctionId" = ${auctionId}
        AND b."isRetracted" = false
        AND u."deletedAt" IS NULL
      GROUP BY u.id, u."firstName", u."lastName", u."phoneNumber", f.url
      ORDER BY MAX(b.amount) DESC
      LIMIT 3
    `;

    const winners = winnersData.map((w, index) => ({
      rank: index + 1,
      userId: w.userId,
      firstName: w.firstName,
      lastName: w.lastName,
      phoneNumber: w.phoneNumber,
      avatarUrl: w.avatarUrl,
      highestBid:
        typeof w.highestBid === 'number'
          ? w.highestBid
          : Number(w.highestBid) || 0,
      bidCount: Number(w.bidCount),
    }));

    return { winners };
  }

  async getLeaderboard(
    auctionId: string,
    limit?: number,
  ): Promise<{
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
  }> {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }

    const maxLimit = limit ? Math.min(limit, 100) : undefined;

    let query = Prisma.sql`
      SELECT
        u.id as "userId",
        u."firstName" as "firstName",
        u."lastName" as "lastName",
        u."phoneNumber" as "phoneNumber",
        f.url as "avatarUrl",
        MAX(b.amount) as "highestBid",
        COUNT(b.id)::bigint as "bidCount",
        SUM(b.amount) as "totalBidAmount",
        MAX(b."createdAt") as "lastBidAt"
      FROM bids b
      INNER JOIN users u ON b."bidderId" = u.id
      LEFT JOIN files f ON u."avatarId" = f.id
      WHERE b."auctionId" = ${auctionId}
        AND b."isRetracted" = false
        AND u."deletedAt" IS NULL
      GROUP BY u.id, u."firstName", u."lastName", u."phoneNumber", f.url
      ORDER BY MAX(b.amount) DESC, COUNT(b.id) DESC
    `;

    if (maxLimit) {
      query = Prisma.sql`${query} LIMIT ${maxLimit}`;
    }

    const leaderboardData = await this.prisma.$queryRaw<
      Array<{
        userId: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
        avatarUrl: string | null;
        highestBid: unknown;
        bidCount: bigint;
        totalBidAmount: unknown;
        lastBidAt: Date | null;
      }>
    >(query);

    const leaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      firstName: entry.firstName,
      lastName: entry.lastName,
      phoneNumber: entry.phoneNumber,
      avatarUrl: entry.avatarUrl,
      highestBid:
        typeof entry.highestBid === 'number'
          ? entry.highestBid
          : Number(entry.highestBid) || 0,
      bidCount: Number(entry.bidCount),
      totalBidAmount:
        typeof entry.totalBidAmount === 'number'
          ? entry.totalBidAmount
          : Number(entry.totalBidAmount) || 0,
      lastBidAt: entry.lastBidAt,
    }));

    return {
      leaderboard,
      totalParticipants: leaderboard.length,
    };
  }
}
