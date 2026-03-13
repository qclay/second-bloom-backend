import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { BidRepository } from './repositories/bid.repository';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidQueryDto } from './dto/bid-query.dto';
import { BidResponseDto } from './dto/bid-response.dto';
import { Prisma, AuctionStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuctionRepository } from '../auction/repositories/auction.repository';
import { NotificationService } from '../notification/notification.service';
import type { Request } from 'express';
import { AuctionSchedulingService } from '../auction/auction-scheduling.service';

@Injectable()
export class BidService {
  private readonly logger = new Logger(BidService.name);

  constructor(
    private readonly bidRepository: BidRepository,
    private readonly auctionRepository: AuctionRepository,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly auctionSchedulingService: AuctionSchedulingService,
  ) { }

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
    const bidder = await this.prisma.user.findUnique({
      where: { id: bidderId },
      select: { auctionBannedUntil: true },
    });
    if (
      bidder?.auctionBannedUntil &&
      bidder.auctionBannedUntil.getTime() > now.getTime()
    ) {
      throw new ForbiddenException(
        `You are temporarily banned from participating in auctions until ${bidder.auctionBannedUntil.toISOString()}. Contact support for more information.`,
      );
    }

    const rejectedCountInAuction = await this.prisma.bid.count({
      where: {
        auctionId: dto.auctionId,
        bidderId,
        rejectedAt: { not: null },
      },
    });
    if (rejectedCountInAuction >= 2) {
      throw new ForbiddenException(
        'You can no longer participate in this auction because your bids were rejected twice by the seller.',
      );
    }

    const bidderBlockedByCreator =
      await this.prisma.conversationParticipant.findFirst({
        where: {
          userId: bidderId,
          isBlocked: true,
          conversation: {
            participants: {
              some: { userId: auction.creatorId },
            },
            deletedAt: null,
          },
        },
        select: { id: true },
      });
    if (bidderBlockedByCreator) {
      throw new ForbiddenException(
        'You cannot participate in this auction. The seller has restricted your access.',
      );
    }

    const BID_RATE_LIMIT_MS = 60_000;
    const lastValidBidByUser = await this.prisma.bid.findFirst({
      where: {
        auctionId: dto.auctionId,
        bidderId,
        isRetracted: false,
        rejectedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (lastValidBidByUser) {
      const elapsed = now.getTime() - lastValidBidByUser.createdAt.getTime();
      if (elapsed < BID_RATE_LIMIT_MS) {
        const secondsLeft = Math.ceil((BID_RATE_LIMIT_MS - elapsed) / 1000);
        throw new BadRequestException(
          `You can place or update your bid once per minute. Try again in ${secondsLeft} second(s).`,
        );
      }
    }

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

    let autoExtendedNewEndTime: Date | null = null;

    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await (
          tx as { $executeRaw: (args: unknown) => Promise<unknown> }
        ).$executeRaw(
          Prisma.sql`SELECT 1 FROM auctions WHERE id = ${dto.auctionId} FOR UPDATE`,
        );

        const auctionInTx = await tx.auction.findUnique({
          where: { id: dto.auctionId },
          select: {
            status: true,
            endTime: true,
            startPrice: true,
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

        const nowInTx = new Date();
        if (auctionInTx.endTime <= nowInTx) {
          throw new BadRequestException(
            'Auction has ended. Bids are not accepted after the end time.',
          );
        }

        const existingBidsByUser = await tx.bid.findMany({
          where: {
            auctionId: dto.auctionId,
            bidderId,
            isRetracted: false,
            rejectedAt: null,
          },
          select: { id: true },
        });
        const deletedBidIds = existingBidsByUser.map((b) => b.id);

        if (deletedBidIds.length > 0) {
          await tx.bid.deleteMany({
            where: { id: { in: deletedBidIds } },
          });
          await tx.auction.update({
            where: { id: dto.auctionId },
            data: {
              totalBids: { decrement: deletedBidIds.length },
            },
          });
          if (
            previousWinningBid &&
            previousWinningBid.bidderId === bidderId &&
            deletedBidIds.includes(previousWinningBid.id)
          ) {
            const newHighest = await tx.bid.findFirst({
              where: { auctionId: dto.auctionId },
              orderBy: { amount: 'desc' },
              select: { id: true, amount: true },
            });
            if (newHighest) {
              await tx.bid.update({
                where: { id: newHighest.id },
                data: { isWinning: true },
              });
              await tx.auction.update({
                where: { id: dto.auctionId },
                data: { currentPrice: newHighest.amount },
              });
            } else {
              const startPrice = Number(auctionInTx.startPrice);
              await tx.auction.update({
                where: { id: dto.auctionId },
                data: { currentPrice: startPrice },
              });
            }
          }
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
          const timeUntilEnd =
            auctionInTx.endTime.getTime() - nowInTx.getTime();
          const extendThreshold = auctionInTx.extendMinutes * 60 * 1000;

          if (timeUntilEnd > 0 && timeUntilEnd <= extendThreshold) {
            const newEndTime = new Date(
              nowInTx.getTime() + auctionInTx.extendMinutes * 60 * 1000,
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
            autoExtendedNewEndTime = newEndTime;
          }
        }

        return { createdBid, deletedBidIds };
      },
    );

    const { createdBid: bid, deletedBidIds } = result;

    this.logger.log(
      `Bid created: ${bid.id} for auction ${dto.auctionId} by user ${bidderId}. Amount: ${bidAmount}` +
      (deletedBidIds.length > 0
        ? ` (replaced ${deletedBidIds.length} previous bid(s))`
        : ''),
    );

    if (autoExtendedNewEndTime) {
      await this.safeRescheduleAuctionJob(dto.auctionId, autoExtendedNewEndTime);
      try {
        const participants = await this.prisma.bid.findMany({
          where: { auctionId: dto.auctionId, isRetracted: false },
          select: { bidderId: true },
          distinct: ['bidderId'],
        });
        await Promise.all(
          participants.map((p) =>
            this.notificationService.notifyAuctionExtendedForParticipant({
              userId: p.bidderId,
              auctionId: dto.auctionId,
              productId: auction.productId,
              newEndTime: autoExtendedNewEndTime!,
            }),
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to send AUCTION_EXTENDED notifications for auction ${dto.auctionId}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    const bidResponse = await this.findById(bid.id);

    try {
      await this.notificationService.notifyNewBidForSeller({
        sellerId: auction.creatorId,
        auctionId: auction.id,
        productId: auction.productId,
        amount: Number(bidAmount),
        currency: 'UZS',
      });
    } catch (error) {
      this.logger.error(
        `Failed to send NEW_BID notification for auction ${auction.id}`,
        error instanceof Error ? error.stack : error,
      );
    }

    if (outbidUserId && outbidUserId !== bidderId) {
      this.logger.log(
        `User ${outbidUserId} was outbid on auction ${dto.auctionId}`,
      );

      try {
        await this.notificationService.notifyOutbid({
          userId: outbidUserId,
          auctionId: auction.id,
          productId: auction.productId,
          amount: Number(bidAmount),
          currency: 'UZS',
        });
      } catch (error) {
        this.logger.error(
          `Failed to send OUTBID notification for auction ${auction.id}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    const updatedAuction = await this.auctionRepository.findById(dto.auctionId);
    if (updatedAuction) {
      const auctionEndTime = new Date(updatedAuction.endTime);
      const originalEndTime = new Date(auction.endTime);

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
      view,
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    let where: Prisma.BidWhereInput;

    if (view) {
      where =
        view === 'new'
          ? {
            auctionId: auctionId ?? undefined,
            readByOwnerAt: null,
            rejectedAt: null,
            isRetracted: false,
          }
          : view === 'rejected'
            ? {
              auctionId: auctionId ?? undefined,
              rejectedAt: { not: null },
            }
            : view === 'top'
              ? {
                auctionId: auctionId ?? undefined,
                isWinning: true,
              }
              : {
                auctionId: auctionId ?? undefined,
              };
    } else {
      where = {};

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
    }

    let orderBy: Prisma.BidOrderByWithRelationInput;
    if (view === 'top') {
      orderBy = { amount: 'desc' };
    } else {
      orderBy = {};
      if (sortBy === 'amount') {
        orderBy.amount = sortOrder;
      } else if (sortBy === 'createdAt') {
        orderBy.createdAt = sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }
    }

    const [bids, total, counts] = await Promise.all([
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
              avatar: { select: { url: true } },
            },
          },
        },
      }),
      this.bidRepository.count({ where }),
      auctionId ? this.getAuctionBidCounts(auctionId) : Promise.resolve(null),
    ]);

    return {
      data: bids.map((bid) => BidResponseDto.fromEntity(bid)),
      meta: {
        ...(view ? { view } : {}),
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
        ...(counts ? { counts } : {}),
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
            avatar: { select: { url: true } },
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

    const isOwner = auction.creatorId === userId;
    if (bid.bidderId !== userId && userRole !== UserRole.ADMIN && !isOwner) {
      throw new ForbiddenException(
        'Only the bidder, auction owner, or admin can retract/remove this bid',
      );
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.bid.update({
        where: { id },
        data: {
          isRetracted: true,
          isWinning: false,
          ...(isOwner && {
            rejectedAt: new Date(),
            rejectedBy: userId,
          }),
        },
      });

      if (bid.isWinning) {
        const newWinningBid = await tx.bid.findFirst({
          where: {
            auctionId: bid.auctionId,
            id: { not: id },
            isRetracted: false,
            rejectedAt: null,
          },
          orderBy: {
            amount: 'desc',
          },
          select: { id: true, amount: true },
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
      `Bid ${id} ${isOwner ? 'removed by owner' : userId === bid.bidderId ? 'retracted by bidder' : 'retracted by admin'}`,
    );

    const updatedAuction = await this.auctionRepository.findById(bid.auctionId);

    if (isOwner && bid.bidderId !== userId) {
      const rejectedBid = await this.findById(id);
      try {
        await this.notificationService.notifyBidRejected({
          userId: bid.bidderId,
          auctionId: auction.id,
          productId: auction.productId,
          amount: Number(bid.amount),
          currency: 'UZS',
        });
      } catch (error) {
        this.logger.error(
          `Failed to send BID_REJECTED notification for bid ${id}`,
          error instanceof Error ? error.stack : error,
        );
      }

      await this.applyPlatformBanIfNeeded(bid.bidderId);
    }
  }

  private static readonly PLATFORM_BAN_DAYS = 3;
  private static readonly PLATFORM_BAN_STRIKES = 6;

  private async applyPlatformBanIfNeeded(bidderId: string): Promise<void> {
    const rejectedBids = await this.prisma.bid.findMany({
      where: {
        bidderId,
        rejectedAt: { not: null },
      },
      select: {
        auction: {
          select: { creatorId: true },
        },
      },
    });
    const distinctSellerIds = [
      ...new Set(rejectedBids.map((b) => b.auction.creatorId)),
    ];
    if (distinctSellerIds.length < BidService.PLATFORM_BAN_STRIKES) {
      return;
    }
    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + BidService.PLATFORM_BAN_DAYS);
    await this.prisma.user.update({
      where: { id: bidderId },
      data: { auctionBannedUntil: bannedUntil },
    });
    this.logger.log(
      `Platform auction ban applied for user ${bidderId} until ${bannedUntil.toISOString()} (${distinctSellerIds.length} strikes)`,
    );
  }

  async restoreBid(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<BidResponseDto> {
    const bid = await this.bidRepository.findById(id);

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    const auction = await this.auctionRepository.findById(bid.auctionId);

    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.status !== AuctionStatus.ACTIVE) {
      throw new BadRequestException('Cannot restore bid on inactive auction');
    }

    const isOwner = auction.creatorId === userId;
    if (!isOwner && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the auction owner or admin can restore a rejected bid',
      );
    }

    if (bid.rejectedAt == null) {
      throw new BadRequestException(
        'Bid was not rejected by owner; nothing to restore',
      );
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.bid.update({
        where: { id },
        data: {
          rejectedAt: null,
          rejectedBy: null,
          isRetracted: false,
        },
      });

      const winningBid = await tx.bid.findFirst({
        where: {
          auctionId: bid.auctionId,
          isRetracted: false,
          rejectedAt: null,
        },
        orderBy: { amount: 'desc' },
        select: { id: true, amount: true },
      });

      if (winningBid) {
        await tx.bid.updateMany({
          where: { auctionId: bid.auctionId },
          data: { isWinning: false },
        });
        await tx.bid.update({
          where: { id: winningBid.id },
          data: { isWinning: true },
        });
        await tx.auction.update({
          where: { id: bid.auctionId },
          data: { currentPrice: winningBid.amount },
        });
      }
    });

    this.logger.log(
      `Bid ${id} restored by ${isOwner ? 'auction owner' : 'admin'} (user: ${userId})`,
    );

    return this.findById(id);
  }

  async getAuctionBidCounts(auctionId: string): Promise<{
    all: number;
    new: number;
    top: number;
    rejected: number;
  }> {
    const auction = await this.auctionRepository.findById(auctionId);
    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }
    const base = { auctionId, deletedAt: null };
    const [all, newCount, top, rejected] = await Promise.all([
      this.prisma.bid.count({ where: base }),
      this.prisma.bid.count({
        where: {
          ...base,
          readByOwnerAt: null,
          rejectedAt: null,
          isRetracted: false,
        },
      }),
      this.prisma.bid.count({
        where: { ...base, isWinning: true },
      }),
      this.prisma.bid.count({
        where: { ...base, rejectedAt: { not: null } },
      }),
    ]);
    return { all, new: newCount, top, rejected };
  }

  async markBidAsRead(bidId: string, userId: string): Promise<void> {
    const bid = await this.bidRepository.findById(bidId);
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found`);
    }
    const auction = await this.auctionRepository.findById(bid.auctionId);
    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }
    if (auction.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the auction owner can mark bids as read',
      );
    }
    await this.prisma.bid.update({
      where: { id: bidId },
      data: { readByOwnerAt: new Date() },
    });
  }

  async markAllBidsAsRead(
    auctionId: string,
    userId: string,
  ): Promise<{ markedCount: number }> {
    const auction = await this.auctionRepository.findById(auctionId);
    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }
    if (auction.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the auction owner can mark bids as read',
      );
    }
    const result = await this.prisma.bid.updateMany({
      where: {
        auctionId,
        readByOwnerAt: null,
        rejectedAt: null,
        isRetracted: false,
      },
      data: { readByOwnerAt: new Date() },
    });
    return { markedCount: result.count };
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
                    orderBy: { displayOrder: 'asc' },
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
              avatar: { select: { url: true } },
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

  private async safeRescheduleAuctionJob(
    auctionId: string,
    endTime: Date,
  ): Promise<void> {
    try {
      await this.auctionSchedulingService.rescheduleAuctionEnd(auctionId, endTime);
    } catch (error) {
      this.logger.error(
        `Failed to reschedule auction job after auto-extend for ${auctionId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
