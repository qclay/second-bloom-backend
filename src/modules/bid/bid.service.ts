import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { BidRepository } from './repositories/bid.repository';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidQueryDto } from './dto/bid-query.dto';
import { BidResponseDto } from './dto/bid-response.dto';
import { Prisma, AuctionStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuctionRepository } from '../auction/repositories/auction.repository';
import { AuctionGateway } from '../auction/gateways/auction.gateway';
import type { Request } from 'express';

@Injectable()
export class BidService {
  private readonly logger = new Logger(BidService.name);

  constructor(
    private readonly bidRepository: BidRepository,
    private readonly auctionRepository: AuctionRepository,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AuctionGateway))
    private readonly auctionGateway: AuctionGateway,
  ) {}

  async createBid(
    dto: CreateBidDto,
    bidderId: string,
    request?: Request,
  ): Promise<BidResponseDto> {
    const auction = await this.auctionRepository.findById(dto.auctionId);

    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.creatorId === bidderId) {
      throw new ForbiddenException('You cannot bid on your own auction');
    }

    const now = new Date();

    const bidAmount = dto.amount;
    const minBidAmount = Number(auction.minBidAmount);
    const currentPrice = Number(auction.currentPrice);
    const bidIncrement = Number(auction.bidIncrement);

    if (bidAmount < minBidAmount) {
      throw new BadRequestException(
        `Bid amount must be at least ${minBidAmount}`,
      );
    }

    const minimumRequiredBid = currentPrice + bidIncrement;
    if (bidAmount < minimumRequiredBid) {
      throw new BadRequestException(
        `Bid amount must be at least ${minimumRequiredBid} (current price + increment)`,
      );
    }

    const previousWinningBid = await this.bidRepository.findWinningBid(
      dto.auctionId,
    );

    const outbidUserId = previousWinningBid?.bidderId ?? null;

    const bid = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const auctionInTx = await tx.auction.findUnique({
          where: { id: dto.auctionId },
          select: {
            status: true,
            endTime: true,
            autoExtend: true,
            extendMinutes: true,
            version: true,
          },
        });

        if (!auctionInTx) {
          throw new NotFoundException('Auction not found');
        }

        if (auctionInTx.status !== AuctionStatus.ACTIVE) {
          throw new BadRequestException('Auction is not active');
        }

        if (auctionInTx.endTime <= now) {
          throw new BadRequestException('Auction has ended');
        }

        const createdBid = await tx.bid.create({
          data: {
            auction: {
              connect: { id: dto.auctionId },
            },
            bidder: {
              connect: { id: bidderId },
            },
            amount: bidAmount,
            ipAddress: request?.ip ?? request?.socket.remoteAddress ?? null,
            userAgent: request?.headers['user-agent'] ?? null,
          },
        });

        await tx.bid.updateMany({
          where: {
            auctionId: dto.auctionId,
            id: { not: createdBid.id },
            isWinning: true,
          },
          data: {
            isWinning: false,
          },
        });

        await tx.bid.update({
          where: { id: createdBid.id },
          data: {
            isWinning: true,
          },
        });

        await tx.auction.update({
          where: { id: dto.auctionId },
          data: {
            totalBids: {
              increment: 1,
            },
            currentPrice: bidAmount,
            lastBidAt: now,
          },
        });

        if (auctionInTx.autoExtend) {
          const timeUntilEnd = auctionInTx.endTime.getTime() - now.getTime();
          const extendThreshold = auctionInTx.extendMinutes * 60 * 1000;

          if (timeUntilEnd > 0 && timeUntilEnd <= extendThreshold) {
            const newEndTime = new Date(
              now.getTime() + auctionInTx.extendMinutes * 60 * 1000,
            );

            await tx.auction.update({
              where: { id: dto.auctionId },
              data: {
                endTime: newEndTime,
                version: {
                  increment: 1,
                },
              },
            });

            this.logger.log(
              `Auction ${dto.auctionId} auto-extended until ${newEndTime.toISOString()}`,
            );
          }
        }

        return createdBid;
      },
    );

    this.logger.log(
      `Bid created: ${bid.id} for auction ${dto.auctionId} by user ${bidderId}. Amount: ${bidAmount}`,
    );

    // Get the full bid response with relations for WebSocket notification
    const bidResponse = await this.findById(bid.id);

    // Notify all users in the auction room about the new bid
    this.auctionGateway.notifyNewBid(dto.auctionId, bidResponse);

    // Notify the outbid user if there was one
    if (outbidUserId && outbidUserId !== bidderId) {
      this.logger.log(
        `User ${outbidUserId} was outbid on auction ${dto.auctionId}`,
      );
      this.auctionGateway.notifyOutbid(
        outbidUserId,
        dto.auctionId,
        bidResponse,
      );
    }

    // Check if auction was extended and notify
    const updatedAuction = await this.auctionRepository.findById(dto.auctionId);
    if (updatedAuction) {
      const auctionEndTime = new Date(updatedAuction.endTime);
      const originalEndTime = new Date(auction.endTime);

      // If end time was extended, notify users
      if (auctionEndTime > originalEndTime) {
        this.auctionGateway.notifyAuctionExtended(
          dto.auctionId,
          auctionEndTime,
          'Auto-extended due to last-minute bid',
        );
      }

      // Notify about auction update (current price, total bids, etc.)
      const auctionResponse = await this.auctionRepository
        .findById(dto.auctionId)
        .then((a) => {
          if (!a) return null;
          // You may need to convert to AuctionResponseDto here
          return a;
        });

      if (auctionResponse) {
        // Import and use AuctionResponseDto.fromEntity if available
        // For now, we'll just notify with the updated auction data
        // The gateway will handle the formatting
      }
    }

    return bidResponse;
  }

  async findAll(query: BidQueryDto) {
    const {
      page = 1,
      limit = 20,
      auctionId,
      bidderId,
      isWinning,
      isRetracted,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.BidWhereInput = {};

    if (auctionId) {
      where.auctionId = auctionId;
    }

    if (bidderId) {
      where.bidderId = bidderId;
    }

    if (isWinning !== undefined) {
      where.isWinning = isWinning;
    }

    if (isRetracted !== undefined) {
      where.isRetracted = isRetracted;
    } else {
      where.isRetracted = false;
    }

    const orderBy: Prisma.BidOrderByWithRelationInput = {};
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [bids, total] = await Promise.all([
      this.bidRepository.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy,
        include: {
          auction: {
            select: {
              id: true,
              productId: true,
              currentPrice: true,
              status: true,
              endTime: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
          bidder: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      }),
      this.bidRepository.count({ where }),
    ]);

    return {
      data: bids.map((bid) => BidResponseDto.fromEntity(bid)),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async findById(id: string): Promise<BidResponseDto> {
    const bid = await this.prisma.bid.findUnique({
      where: { id },
      include: {
        auction: {
          select: {
            id: true,
            productId: true,
            currentPrice: true,
            status: true,
            endTime: true,
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        bidder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    return BidResponseDto.fromEntity(bid);
  }

  async retractBid(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const bid = await this.bidRepository.findById(id);

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    if (bid.isRetracted) {
      throw new BadRequestException('Bid is already retracted');
    }

    const auction = await this.auctionRepository.findById(bid.auctionId);

    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.status !== AuctionStatus.ACTIVE) {
      throw new BadRequestException('Cannot retract bid on inactive auction');
    }

    if (bid.bidderId !== userId && userRole !== UserRole.ADMIN) {
      if (auction.creatorId !== userId) {
        throw new ForbiddenException(
          'Only the bidder or auction creator can retract this bid',
        );
      }
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.bid.update({
        where: { id },
        data: {
          isRetracted: true,
          isWinning: false,
        },
      });

      if (bid.isWinning) {
        const newWinningBid = await tx.bid.findFirst({
          where: {
            auctionId: bid.auctionId,
            id: { not: id },
            isRetracted: false,
          },
          orderBy: {
            amount: 'desc',
          },
        });

        if (newWinningBid) {
          await tx.bid.update({
            where: { id: newWinningBid.id },
            data: {
              isWinning: true,
            },
          });

          await tx.auction.update({
            where: { id: bid.auctionId },
            data: {
              currentPrice: newWinningBid.amount,
            },
          });
        } else {
          await tx.auction.update({
            where: { id: bid.auctionId },
            data: {
              currentPrice: auction.startPrice,
            },
          });
        }
      }
    });

    this.logger.log(
      `Bid ${id} retracted by ${userId === bid.bidderId ? 'bidder' : 'seller'}`,
    );
  }

  async getAuctionBids(auctionId: string) {
    const auction = await this.auctionRepository.findById(auctionId);

    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }

    const bids = await this.bidRepository.findMany({
      where: {
        auctionId,
        isRetracted: false,
      },
      orderBy: {
        amount: 'desc',
      },
      include: {
        bidder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    return bids.map((bid) => BidResponseDto.fromEntity(bid));
  }

  async getUserBids(userId: string, query: BidQueryDto) {
    const {
      page = 1,
      limit = 20,
      auctionId,
      isWinning,
      isRetracted,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.BidWhereInput = {
      bidderId: userId,
      ...(auctionId && { auctionId }),
      ...(isWinning !== undefined && { isWinning }),
      ...(isRetracted !== undefined ? { isRetracted } : { isRetracted: false }),
    };

    const orderBy: Prisma.BidOrderByWithRelationInput = {};
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [bids, total] = await Promise.all([
      this.bidRepository.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy,
        include: {
          auction: {
            select: {
              id: true,
              productId: true,
              currentPrice: true,
              status: true,
              endTime: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  images: {
                    include: {
                      file: {
                        select: {
                          url: true,
                        },
                      },
                    },
                    orderBy: { order: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
          bidder: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      }),
      this.bidRepository.count({ where }),
    ]);

    return {
      data: bids.map((bid) => BidResponseDto.fromEntity(bid)),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }
}
