import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AuctionRepository } from './repositories/auction.repository';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { ChooseWinnerDto } from './dto/choose-winner.dto';
import { AuctionQueryDto } from './dto/auction-query.dto';
import { AuctionResponseDto } from './dto/auction-response.dto';
import { Prisma, AuctionStatus, UserRole, MessageType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductRepository } from '../product/repositories/product.repository';
import { NotificationService } from '../notification/notification.service';
import { ConversationService } from '../conversation/conversation.service';
import { OrderService } from '../order/order.service';
import {
  isTranslationRecord,
  resolveTranslation,
} from '../../common/i18n/translation.util';
import { AuctionSchedulingService } from './auction-scheduling.service';
import { API_MESSAGES } from '../../common/i18n/api-messages.i18n';
import { t, type Locale } from '../../common/i18n/translation.util';

@Injectable()
export class AuctionService {
  private readonly logger = new Logger(AuctionService.name);
  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly auctionSchedulingService: AuctionSchedulingService,
    private readonly conversationService: ConversationService,
    private readonly moduleRef: ModuleRef,
  ) { }

  async createAuction(
    dto: CreateAuctionDto,
    creatorId: string,
    userRole?: UserRole,
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

    const isAdmin = userRole === UserRole.ADMIN;
    if (product.sellerId !== creatorId && !isAdmin) {
      throw new ForbiddenException(
        'You can only create auctions for your own products',
      );
    }

    if (!['PUBLISHED', 'PENDING'].includes(product.status)) {
      throw new BadRequestException(
        'Product must be active or pending to create an auction',
      );
    }

    const now = new Date();
    let endTime: Date;
    if (dto.endTime) {
      endTime = new Date(dto.endTime);
      if (endTime <= now) {
        throw new BadRequestException('End time must be in the future');
      }
    } else {
      endTime = now;
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
            status: { in: ['ACTIVE', 'PENDING'] },
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
            status: AuctionStatus.PENDING,
            autoExtend: dto.autoExtend ?? true,
            extendMinutes: dto.extendMinutes ?? 5,
          },
        });
      },
    );

    this.logger.log(
      `Auction created: ${auction.id} for product ${dto.productId} (Status: PENDING)`,
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
      where.OR = [
        { status: AuctionStatus.PENDING },
        { status: AuctionStatus.ACTIVE, endTime: { gte: new Date() } },
      ];
    } else if (active === false) {
      where.OR = [
        { status: { notIn: ['ACTIVE', 'PENDING'] } },
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
              isCharity: true,
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
            isCharity: true,
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

    if (
      !['ACTIVE', 'PENDING'].includes(auction.status) &&
      dto.status !== 'CANCELLED'
    ) {
      throw new BadRequestException(
        'Can only update active/pending auctions or cancel them',
      );
    }

    const updateData: Prisma.AuctionUpdateInput = {};
    let updatedEndTime: Date | null = null;
    let shouldCancelJob = false;

    if (dto.endTime !== undefined) {
      const endTime = new Date(dto.endTime);
      if (endTime <= new Date()) {
        throw new BadRequestException('End time must be in the future');
      }
      updateData.endTime = endTime;
      updatedEndTime = endTime;
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
        shouldCancelJob = true;
      }
    }

    await this.auctionRepository.update(id, updateData);
    if (shouldCancelJob) {
      await this.safeCancelAuctionJob(id);
    } else if (updatedEndTime) {
      await this.safeRescheduleAuctionJob(id, updatedEndTime);
    }

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
    await this.safeCancelAuctionJob(id);
  }

  async chooseWinner(
    id: string,
    dto: ChooseWinnerDto,
    userId: string,
    userRole: UserRole,
  ): Promise<AuctionResponseDto> {
    const auction = await this.auctionRepository.findById(id);

    if (!auction || auction.deletedAt) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    if (auction.creatorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only set winner for your own auctions',
      );
    }

    if (auction.status !== 'ACTIVE' && auction.status !== 'ENDED') {
      throw new BadRequestException(
        'Winner can only be chosen for active or ended auctions',
      );
    }

    const winnerId = dto.winnerId ?? null;

    if (!winnerId) {
      throw new BadRequestException('Winner ID is required');
    }

    let winnerLanguage: string | null = null;
    const userExists = await this.prisma.user.findUnique({
      where: { id: winnerId },
      select: { id: true, language: true },
    });
    if (!userExists) {
      throw new BadRequestException(`User ${winnerId} not found`);
    }
    winnerLanguage = userExists.language ?? null;

    const winnerBidCount = await this.prisma.bid.count({
      where: {
        auctionId: id,
        bidderId: winnerId,
        isRetracted: false,
        rejectedAt: null,
      },
    });
    if (winnerBidCount === 0) {
      throw new BadRequestException(
        'Chosen winner must have at least one bid on this auction',
      );
    }

    if (auction.status === 'ACTIVE') {
      await this.safeCancelAuctionJob(id);
    }

    const winningBidData = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await tx.bid.updateMany({
          where: { auctionId: id },
          data: { isWinning: false },
        });

        const winningBid = await tx.bid.findFirst({
          where: {
            auctionId: id,
            bidderId: winnerId,
            isRetracted: false,
            rejectedAt: null,
          },
          orderBy: { amount: 'desc' },
          select: { id: true, amount: true },
        });
        if (!winningBid) {
          throw new BadRequestException(
            'No valid bid found for the chosen winner.',
          );
        }

        await tx.bid.update({
          where: { id: winningBid.id },
          data: { isWinning: true },
        });

        await tx.auction.update({
          where: { id },
          data: { winnerId, status: 'ENDED' },
        });

        return { amount: Number(winningBid.amount) };
      },
    );

    const winningBidAmount = winningBidData.amount;

    this.logger.log(
      `Auction ${id} winner set to ${winnerId} by user ${userId}, status set to ENDED`,
    );

    let chatId: string | null = null;

    try {
      const product = await this.prisma.product.findUnique({
        where: { id: auction.productId },
        select: {
          id: true,
          title: true,
          price: true,
          sellerId: true,
          images: {
            take: 1,
            orderBy: { displayOrder: 'asc' as const },
            select: { file: { select: { url: true } } },
          },
        },
      });

      if (!product) {
        this.logger.warn(
          `Skipping order/chat creation for auction ${id}: product not found or deleted`,
        );
      } else {
        const orderService = this.moduleRef.get(OrderService, {
          strict: false,
        });
        const orderResult = await orderService.createOrderFromAuctionWinner({
          auctionId: id,
          productId: product.id,
          buyerId: winnerId,
          amount: winningBidAmount,
        });

        const order = await this.prisma.order.findUnique({
          where: { id: orderResult.id },
          select: { id: true, orderNumber: true, status: true },
        });

        this.logger.log(
          `Order ${orderResult.id} created for auction winner ${winnerId}`,
        );

        if (!order) {
          this.logger.warn(
            `Order ${orderResult.id} not found after creation, skipping banner notification`,
          );
        } else {
          const conversation =
            await this.conversationService.getOrCreateConversationByProduct(
              product.id,
              product.sellerId,
              winnerId,
              {
                type: 'AUCTION_WINNER',
                auctionId: id,
                productId: product.id,
                orderId: order.id,
              },
            );

          chatId = conversation.id;

          const existingConv = await this.prisma.conversation.findUnique({
            where: { id: conversation.id },
            select: { orderId: true },
          });

          if (!existingConv?.orderId) {
            await this.prisma.conversation.update({
              where: { id: conversation.id },
              data: { orderId: order.id },
            });
          }

          const winnerMessage = t(
            API_MESSAGES,
            'AUCTION_WINNER_CHAT',
            {},
            (winnerLanguage as Locale) || 'uz',
          );

          await this.conversationService.sendMessageAsSender(
            conversation.id,
            product.sellerId,
            winnerMessage,
            undefined,
            MessageType.SYSTEM,
          );

          await this.notificationService.notifyAuctionEndedForParticipant({
            userId: winnerId,
            auctionId: id,
            productId: product.id,
            productTitle: isTranslationRecord(product.title)
              ? (resolveTranslation(product.title, winnerLanguage ?? 'en') ??
                undefined)
              : typeof product.title === 'string'
                ? product.title
                : undefined,
            isWinner: true,
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to create order/chat for auction winner ${winnerId} in auction ${id}`,
        error instanceof Error ? error.stack : error,
      );
    }

    const auctionDto = await this.findById(id);
    return { ...auctionDto, chatId };
  }

  async cancelWinner(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<AuctionResponseDto> {
    const auction = await this.auctionRepository.findById(id);

    if (!auction || auction.deletedAt) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    if (auction.creatorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You can only cancel winner for your own auctions',
      );
    }

    if (auction.status !== 'ENDED') {
      throw new BadRequestException(
        'Winner can only be cancelled for ended auctions',
      );
    }

    const currentWinnerId = auction.winnerId;

    if (!currentWinnerId) {
      throw new BadRequestException('Auction does not have a winner to cancel');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.bid.updateMany({
        where: { auctionId: id, isWinning: true },
        data: { isWinning: false, rejectedAt: new Date() },
      });

      await tx.auction.update({
        where: { id },
        data: { winnerId: null },
      });

      const order = await tx.order.findFirst({
        where: { auctionId: id, buyerId: currentWinnerId },
      });

      if (order && order.status !== 'CANCELLED') {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelledBy: userId,
            cancellationReason: 'Auction winner cancelled',
          },
        });
      }
    });

    this.logger.log(
      `Auction ${id} winner ${currentWinnerId} cancelled by user ${userId}`,
    );

    return this.findById(id);
  }

  async closeAuction(
    auctionId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<AuctionResponseDto> {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      select: {
        id: true,
        status: true,
        creatorId: true,
        productId: true,
        deletedAt: true,
      },
    });

    if (!auction || auction.deletedAt) {
      throw new NotFoundException(`Auction with ID ${auctionId} not found`);
    }

    if (!['ACTIVE', 'PENDING'].includes(auction.status)) {
      throw new BadRequestException(
        'Only active or pending auctions can be closed early. Auction status: ' +
        auction.status,
      );
    }

    if (auction.creatorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the auction creator or an admin can close the auction',
      );
    }

    await this.safeCancelAuctionJob(auctionId);

    const updated = await this.finalizeAuction(auctionId, auction.productId);

    this.logger.log(
      `Auction ${auctionId} closed early by user ${userId}. Winner: ${updated.winnerId ?? 'none'}`,
    );

    return updated;
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
          await this.safeRescheduleAuctionJob(auctionId, newEndTime);
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

  async endExpiredAuctions(
    batchSize: number = 100,
  ): Promise<{ endedCount: number; hasMore: boolean }> {
    try {
      const now = new Date();
      const expiredAuctions = await this.prisma.auction.findMany({
        where: {
          status: 'ACTIVE',
          endTime: { lte: now },
          deletedAt: null,
        },
        select: { id: true, productId: true, creatorId: true, totalBids: true },
        take: batchSize,
      });

      if (expiredAuctions.length === 0) {
        return { endedCount: 0, hasMore: false };
      }

      const auctionIds = expiredAuctions.map((a) => a.id);
      const productIds = [...new Set(expiredAuctions.map((a) => a.productId))];

      const [products, allParticipants] = await Promise.all([
        productIds.length > 0
          ? this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true },
          })
          : [],
        auctionIds.length > 0
          ? this.prisma.bid.findMany({
            where: {
              auctionId: { in: auctionIds },
              isRetracted: false,
            },
            select: { auctionId: true, bidderId: true },
            distinct: ['auctionId', 'bidderId'],
          })
          : [],
      ]);

      const productTitleByProductId = new Map(
        products.map((p) => [p.id, p.title]),
      );
      const participantsByAuctionId = new Map<string, { bidderId: string }[]>();
      for (const p of allParticipants) {
        const list = participantsByAuctionId.get(p.auctionId) ?? [];
        list.push({ bidderId: p.bidderId });
        participantsByAuctionId.set(p.auctionId, list);
      }

      let endedCount = 0;
      const errors: Array<{ auctionId: string; error: string }> = [];

      for (const auction of expiredAuctions) {
        try {
          await this.prisma.auction.update({
            where: { id: auction.id },
            data: {
              status: 'ENDED',
              winnerId: null,
            },
          });

          if (auction.totalBids === 0) {
            await this.prisma.$transaction([
              this.prisma.user.update({
                where: { id: auction.creatorId },
                data: { publicationCredits: { increment: 1 } },
              }),
              this.prisma.product.update({
                where: { id: auction.productId },
                data: { status: 'DRAFT' },
              }),
            ]);
            this.logger.log(
              `Refunded 1 publication credit and set product ${auction.productId} to DRAFT for ended auction ${auction.id} with no bids`,
            );
          }

          endedCount++;
          this.logger.log(
            `Auction ${auction.id} ended automatically (no winner selected)`,
          );

          await this.safeCancelAuctionJob(auction.id);

          try {
            const productTitleRaw =
              productTitleByProductId.get(auction.productId) ?? null;
            const productTitle =
              typeof productTitleRaw === 'string'
                ? productTitleRaw
                : isTranslationRecord(productTitleRaw)
                  ? (resolveTranslation(productTitleRaw, 'en') ?? undefined)
                  : undefined;
            const participants = participantsByAuctionId.get(auction.id) ?? [];

            await Promise.all(
              participants.map((p) =>
                this.notificationService.notifyAuctionEndedForParticipant({
                  userId: p.bidderId,
                  auctionId: auction.id,
                  productId: auction.productId,
                  productTitle,
                  isWinner: false,
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

      return { endedCount, hasMore: expiredAuctions.length === batchSize };
    } catch (error) {
      this.logger.error(
        'Error in endExpiredAuctions batch job',
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }

  async processAuctionCompletionJob(auctionId: string): Promise<void> {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      select: {
        id: true,
        status: true,
        productId: true,
        endTime: true,
        deletedAt: true,
      },
    });

    if (!auction || auction.deletedAt) {
      await this.safeCancelAuctionJob(auctionId);
      this.logger.warn(
        `Skipping completion job for auction ${auctionId}: not found or deleted`,
      );
      return;
    }

    if (auction.status !== 'ACTIVE') {
      this.logger.log(
        `Auction ${auctionId} completion job ignored: status is ${auction.status}`,
      );
      return;
    }

    if (auction.endTime > new Date()) {
      this.logger.warn(
        `Auction ${auctionId} completion job fired early. Rescheduling to ${auction.endTime.toISOString()}`,
      );
      await this.safeRescheduleAuctionJob(auctionId, auction.endTime);
      return;
    }

    await this.finalizeAuction(auctionId, auction.productId);
  }

  private async finalizeAuction(
    auctionId: string,
    productId?: string | null,
  ): Promise<AuctionResponseDto> {
    const auctionRecord = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      select: { productId: true, creatorId: true, totalBids: true },
    });
    const resolvedProductId = productId ?? auctionRecord?.productId ?? null;

    await this.prisma.auction.update({
      where: { id: auctionId },
      data: {
        status: 'ENDED',
        winnerId: null,
      },
    });

    if (auctionRecord && auctionRecord.totalBids === 0) {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: auctionRecord.creatorId },
          data: { publicationCredits: { increment: 1 } },
        }),
        ...(resolvedProductId
          ? [
              this.prisma.product.update({
                where: { id: resolvedProductId },
                data: { status: 'DRAFT' },
              }),
            ]
          : []),
      ]);
      this.logger.log(
        `Refunded 1 publication credit and set product ${resolvedProductId} to DRAFT for finalized auction ${auctionId} with no bids`,
      );
    }

    const participants = await this.prisma.bid.findMany({
      where: { auctionId, isRetracted: false },
      select: { bidderId: true },
      distinct: ['bidderId'],
    });

    let productTitle: string | undefined;
    if (resolvedProductId) {
      const product = await this.prisma.product.findUnique({
        where: { id: resolvedProductId },
        select: { title: true },
      });
      const productTitleRaw = product?.title ?? null;
      productTitle =
        typeof productTitleRaw === 'string'
          ? productTitleRaw
          : isTranslationRecord(productTitleRaw)
            ? (resolveTranslation(productTitleRaw, 'en') ?? undefined)
            : undefined;
    }

    if (resolvedProductId) {
      try {
        await Promise.all(
          participants.map((p) =>
            this.notificationService.notifyAuctionEndedForParticipant({
              userId: p.bidderId,
              auctionId,
              productId: resolvedProductId,
              productTitle,
              isWinner: false,
            }),
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to send AUCTION_ENDED notifications for auction ${auctionId}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    const updated = await this.findById(auctionId);
    return updated;
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
      select: { id: true, deletedAt: true },
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
      select: { id: true, deletedAt: true },
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
      select: { id: true, deletedAt: true },
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

  private async safeScheduleAuctionJob(
    auctionId: string,
    endTime: Date,
  ): Promise<void> {
    try {
      await this.auctionSchedulingService.scheduleAuctionEnd(
        auctionId,
        endTime,
      );
    } catch (error) {
      this.logger.error(
        `Failed to schedule auction job for ${auctionId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async safeRescheduleAuctionJob(
    auctionId: string,
    endTime: Date,
  ): Promise<void> {
    try {
      await this.auctionSchedulingService.rescheduleAuctionEnd(
        auctionId,
        endTime,
      );
    } catch (error) {
      this.logger.error(
        `Failed to reschedule auction job for ${auctionId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async safeCancelAuctionJob(auctionId: string): Promise<void> {
    try {
      await this.auctionSchedulingService.cancelAuctionEnd(auctionId);
    } catch (error) {
      this.logger.error(
        `Failed to cancel auction job for ${auctionId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
