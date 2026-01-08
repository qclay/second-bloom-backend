"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuctionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionService = void 0;
const common_1 = require("@nestjs/common");
const auction_repository_1 = require("./repositories/auction.repository");
const auction_response_dto_1 = require("./dto/auction-response.dto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const product_repository_1 = require("../product/repositories/product.repository");
let AuctionService = AuctionService_1 = class AuctionService {
    auctionRepository;
    productRepository;
    prisma;
    logger = new common_1.Logger(AuctionService_1.name);
    constructor(auctionRepository, productRepository, prisma) {
        this.auctionRepository = auctionRepository;
        this.productRepository = productRepository;
        this.prisma = prisma;
    }
    async createAuction(dto, creatorId) {
        this.logger.log(`Creating auction for product ${dto.productId}`);
        const product = await this.productRepository.findById(dto.productId);
        if (!product) {
            this.logger.warn(`Product not found: ${dto.productId} (creatorId: ${creatorId})`);
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.deletedAt) {
            this.logger.warn(`Product is soft-deleted: ${dto.productId} (deletedAt: ${product.deletedAt.toISOString()})`);
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.sellerId !== creatorId) {
            throw new common_1.ForbiddenException('You can only create auctions for your own products');
        }
        if (product.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Product must be active to create an auction');
        }
        const now = new Date();
        const endTime = dto.endTime
            ? new Date(dto.endTime)
            : new Date(now.getTime() + (dto.durationHours ?? 2) * 60 * 60 * 1000);
        if (endTime <= now) {
            throw new common_1.BadRequestException('End time must be in the future');
        }
        if (dto.minBidAmount === undefined) {
            dto.minBidAmount = dto.startPrice;
        }
        if (dto.minBidAmount > dto.startPrice) {
            throw new common_1.BadRequestException('Minimum bid amount cannot be greater than start price');
        }
        const auction = await this.prisma.$transaction(async (tx) => {
            const existingActiveAuction = await tx.auction.findFirst({
                where: {
                    productId: dto.productId,
                    status: 'ACTIVE',
                    deletedAt: null,
                },
            });
            if (existingActiveAuction) {
                throw new common_1.ConflictException('Product already has an active auction');
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
                    minBidAmount: dto.minBidAmount !== undefined
                        ? dto.minBidAmount
                        : dto.startPrice,
                    startTime: now,
                    endTime,
                    durationHours: dto.durationHours ?? 2,
                    status: client_1.AuctionStatus.ACTIVE,
                    autoExtend: dto.autoExtend ?? true,
                    extendMinutes: dto.extendMinutes ?? 5,
                },
            });
        });
        this.logger.log(`Auction created: ${auction.id} for product ${dto.productId}`);
        return this.findById(auction.id);
    }
    async findAll(query) {
        const { page = 1, limit = 20, productId, creatorId, status, active, endingBefore, endingAfter, sortBy = 'endTime', sortOrder = 'asc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
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
        }
        else if (active === false) {
            where.OR = [
                { status: { not: 'ACTIVE' } },
                { endTime: { lt: new Date() } },
            ];
        }
        else if (status) {
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
        const orderBy = {};
        if (sortBy === 'endTime') {
            orderBy.endTime = sortOrder;
        }
        else if (sortBy === 'currentPrice') {
            orderBy.currentPrice = sortOrder;
        }
        else if (sortBy === 'totalBids') {
            orderBy.totalBids = sortOrder;
        }
        else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        }
        else {
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
                                orderBy: { order: 'asc' },
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
            data: auctions.map((auction) => auction_response_dto_1.AuctionResponseDto.fromEntity(auction)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async findById(id, incrementViews = false) {
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
                            orderBy: { order: 'asc' },
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
            throw new common_1.NotFoundException(`Auction with ID ${id} not found`);
        }
        if (auction.deletedAt) {
            throw new common_1.NotFoundException(`Auction with ID ${id} not found`);
        }
        if (incrementViews) {
            await this.auctionRepository.incrementViews(id);
        }
        return auction_response_dto_1.AuctionResponseDto.fromEntity(auction);
    }
    async updateAuction(id, dto, userId, userRole) {
        const auction = await this.auctionRepository.findById(id);
        if (!auction || auction.deletedAt) {
            throw new common_1.NotFoundException(`Auction with ID ${id} not found`);
        }
        if (auction.creatorId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only update your own auctions');
        }
        if (auction.status !== 'ACTIVE' && dto.status !== 'CANCELLED') {
            throw new common_1.BadRequestException('Can only update active auctions or cancel them');
        }
        const updateData = {};
        if (dto.endTime !== undefined) {
            const endTime = new Date(dto.endTime);
            if (endTime <= new Date()) {
                throw new common_1.BadRequestException('End time must be in the future');
            }
            updateData.endTime = endTime;
        }
        if (dto.startPrice !== undefined) {
            if (auction.totalBids > 0) {
                throw new common_1.BadRequestException('Cannot change start price after bids have been placed');
            }
            updateData.startPrice = dto.startPrice;
            updateData.currentPrice = dto.startPrice;
        }
        if (dto.bidIncrement !== undefined) {
            updateData.bidIncrement = dto.bidIncrement;
        }
        if (dto.minBidAmount !== undefined) {
            if (dto.minBidAmount > (dto.startPrice ?? Number(auction.startPrice))) {
                throw new common_1.BadRequestException('Minimum bid amount cannot be greater than start price');
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
                throw new common_1.BadRequestException('Cannot cancel auction with existing bids');
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
    async deleteAuction(id, userId, userRole) {
        const auction = await this.auctionRepository.findById(id);
        if (!auction || auction.deletedAt) {
            throw new common_1.NotFoundException(`Auction with ID ${id} not found`);
        }
        if (auction.creatorId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own auctions');
        }
        if (auction.totalBids > 0) {
            throw new common_1.BadRequestException('Cannot delete auction with existing bids');
        }
        await this.auctionRepository.softDelete(id, userId);
    }
    async extendAuctionIfNeeded(auctionId) {
        try {
            const auction = await this.auctionRepository.findById(auctionId);
            if (!auction || auction.status !== 'ACTIVE' || !auction.autoExtend) {
                return false;
            }
            const now = new Date();
            const timeUntilEnd = auction.endTime.getTime() - now.getTime();
            const extendThreshold = auction.extendMinutes * 60 * 1000;
            if (timeUntilEnd > 0 && timeUntilEnd <= extendThreshold) {
                const newEndTime = new Date(now.getTime() + auction.extendMinutes * 60 * 1000);
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
                    this.logger.log(`Auction ${auctionId} extended until ${newEndTime.toISOString()}`);
                    return true;
                }
                this.logger.warn(`Failed to extend auction ${auctionId}: version mismatch (optimistic locking)`);
                return false;
            }
            return false;
        }
        catch (error) {
            this.logger.error(`Error extending auction ${auctionId}`, error instanceof Error ? error.stack : error);
            return false;
        }
    }
    async endExpiredAuctions() {
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
            const errors = [];
            for (const auction of expiredAuctions) {
                try {
                    await this.prisma.$transaction(async (tx) => {
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
                    });
                    endedCount++;
                    this.logger.log(`Auction ${auction.id} ended. Winner: ${auction.bids[0]?.bidderId ?? 'none'}`);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    errors.push({ auctionId: auction.id, error: errorMessage });
                    this.logger.error(`Failed to end auction ${auction.id}`, error instanceof Error ? error.stack : error);
                }
            }
            if (errors.length > 0) {
                this.logger.warn(`Failed to end ${errors.length} auctions: ${JSON.stringify(errors)}`);
            }
            return endedCount;
        }
        catch (error) {
            this.logger.error('Error in endExpiredAuctions batch job', error instanceof Error ? error.stack : error);
            throw error;
        }
    }
    async getParticipants(auctionId) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
        });
        if (!auction || auction.deletedAt) {
            throw new common_1.NotFoundException('Auction not found');
        }
        const participantsData = await this.prisma.$queryRaw `
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
            highestBid: typeof p.highestBid === 'number'
                ? p.highestBid
                : Number(p.highestBid) || 0,
            totalBidAmount: typeof p.totalBidAmount === 'number'
                ? p.totalBidAmount
                : Number(p.totalBidAmount) || 0,
            lastBidAt: p.lastBidAt,
        }));
        return {
            participants,
            totalParticipants: participants.length,
        };
    }
    async getWinners(auctionId) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
        });
        if (!auction || auction.deletedAt) {
            throw new common_1.NotFoundException('Auction not found');
        }
        const winnersData = await this.prisma.$queryRaw `
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
            highestBid: typeof w.highestBid === 'number'
                ? w.highestBid
                : Number(w.highestBid) || 0,
            bidCount: Number(w.bidCount),
        }));
        return { winners };
    }
    async getLeaderboard(auctionId, limit) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
        });
        if (!auction || auction.deletedAt) {
            throw new common_1.NotFoundException('Auction not found');
        }
        const maxLimit = limit ? Math.min(limit, 100) : undefined;
        let query = client_1.Prisma.sql `
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
            query = client_1.Prisma.sql `${query} LIMIT ${maxLimit}`;
        }
        const leaderboardData = await this.prisma.$queryRaw(query);
        const leaderboard = leaderboardData.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId,
            firstName: entry.firstName,
            lastName: entry.lastName,
            phoneNumber: entry.phoneNumber,
            avatarUrl: entry.avatarUrl,
            highestBid: typeof entry.highestBid === 'number'
                ? entry.highestBid
                : Number(entry.highestBid) || 0,
            bidCount: Number(entry.bidCount),
            totalBidAmount: typeof entry.totalBidAmount === 'number'
                ? entry.totalBidAmount
                : Number(entry.totalBidAmount) || 0,
            lastBidAt: entry.lastBidAt,
        }));
        return {
            leaderboard,
            totalParticipants: leaderboard.length,
        };
    }
};
exports.AuctionService = AuctionService;
exports.AuctionService = AuctionService = AuctionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auction_repository_1.AuctionRepository,
        product_repository_1.ProductRepository,
        prisma_service_1.PrismaService])
], AuctionService);
//# sourceMappingURL=auction.service.js.map