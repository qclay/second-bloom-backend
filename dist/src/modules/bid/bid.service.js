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
var BidService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidService = void 0;
const common_1 = require("@nestjs/common");
const bid_repository_1 = require("./repositories/bid.repository");
const bid_response_dto_1 = require("./dto/bid-response.dto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const auction_repository_1 = require("../auction/repositories/auction.repository");
let BidService = BidService_1 = class BidService {
    bidRepository;
    auctionRepository;
    prisma;
    logger = new common_1.Logger(BidService_1.name);
    constructor(bidRepository, auctionRepository, prisma) {
        this.bidRepository = bidRepository;
        this.auctionRepository = auctionRepository;
        this.prisma = prisma;
    }
    async createBid(dto, bidderId, request) {
        const auction = await this.auctionRepository.findById(dto.auctionId);
        if (!auction || auction.deletedAt) {
            throw new common_1.NotFoundException('Auction not found');
        }
        if (auction.creatorId === bidderId) {
            throw new common_1.ForbiddenException('You cannot bid on your own auction');
        }
        const now = new Date();
        const bidAmount = dto.amount;
        const minBidAmount = Number(auction.minBidAmount);
        const currentPrice = Number(auction.currentPrice);
        const bidIncrement = Number(auction.bidIncrement);
        if (bidAmount < minBidAmount) {
            throw new common_1.BadRequestException(`Bid amount must be at least ${minBidAmount}`);
        }
        const minimumRequiredBid = currentPrice + bidIncrement;
        if (bidAmount < minimumRequiredBid) {
            throw new common_1.BadRequestException(`Bid amount must be at least ${minimumRequiredBid} (current price + increment)`);
        }
        const previousWinningBid = await this.bidRepository.findWinningBid(dto.auctionId);
        const outbidUserId = previousWinningBid?.bidderId ?? null;
        const bid = await this.prisma.$transaction(async (tx) => {
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
                throw new common_1.NotFoundException('Auction not found');
            }
            if (auctionInTx.status !== client_1.AuctionStatus.ACTIVE) {
                throw new common_1.BadRequestException('Auction is not active');
            }
            if (auctionInTx.endTime <= now) {
                throw new common_1.BadRequestException('Auction has ended');
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
                    const newEndTime = new Date(now.getTime() + auctionInTx.extendMinutes * 60 * 1000);
                    await tx.auction.update({
                        where: { id: dto.auctionId },
                        data: {
                            endTime: newEndTime,
                            version: {
                                increment: 1,
                            },
                        },
                    });
                    this.logger.log(`Auction ${dto.auctionId} auto-extended until ${newEndTime.toISOString()}`);
                }
            }
            return createdBid;
        });
        this.logger.log(`Bid created: ${bid.id} for auction ${dto.auctionId} by user ${bidderId}. Amount: ${bidAmount}`);
        if (outbidUserId && outbidUserId !== bidderId) {
            this.logger.log(`User ${outbidUserId} was outbid on auction ${dto.auctionId}`);
        }
        return this.findById(bid.id);
    }
    async findAll(query) {
        const { page = 1, limit = 20, auctionId, bidderId, isWinning, isRetracted, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {};
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
        }
        else {
            where.isRetracted = false;
        }
        const orderBy = {};
        if (sortBy === 'amount') {
            orderBy.amount = sortOrder;
        }
        else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        }
        else {
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
            data: bids.map((bid) => bid_response_dto_1.BidResponseDto.fromEntity(bid)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async findById(id) {
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
            throw new common_1.NotFoundException(`Bid with ID ${id} not found`);
        }
        return bid_response_dto_1.BidResponseDto.fromEntity(bid);
    }
    async retractBid(id, userId, userRole) {
        const bid = await this.bidRepository.findById(id);
        if (!bid) {
            throw new common_1.NotFoundException(`Bid with ID ${id} not found`);
        }
        if (bid.isRetracted) {
            throw new common_1.BadRequestException('Bid is already retracted');
        }
        const auction = await this.auctionRepository.findById(bid.auctionId);
        if (!auction || auction.deletedAt) {
            throw new common_1.NotFoundException('Auction not found');
        }
        if (auction.status !== client_1.AuctionStatus.ACTIVE) {
            throw new common_1.BadRequestException('Cannot retract bid on inactive auction');
        }
        if (bid.bidderId !== userId && userRole !== client_1.UserRole.ADMIN) {
            if (auction.creatorId !== userId) {
                throw new common_1.ForbiddenException('Only the bidder or auction creator can retract this bid');
            }
        }
        await this.prisma.$transaction(async (tx) => {
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
                }
                else {
                    await tx.auction.update({
                        where: { id: bid.auctionId },
                        data: {
                            currentPrice: auction.startPrice,
                        },
                    });
                }
            }
        });
        this.logger.log(`Bid ${id} retracted by ${userId === bid.bidderId ? 'bidder' : 'seller'}`);
    }
    async getAuctionBids(auctionId) {
        const auction = await this.auctionRepository.findById(auctionId);
        if (!auction || auction.deletedAt) {
            throw new common_1.NotFoundException('Auction not found');
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
        return bids.map((bid) => bid_response_dto_1.BidResponseDto.fromEntity(bid));
    }
    async getUserBids(userId, query) {
        const { page = 1, limit = 20, auctionId, isWinning, isRetracted, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
            bidderId: userId,
            ...(auctionId && { auctionId }),
            ...(isWinning !== undefined && { isWinning }),
            ...(isRetracted !== undefined ? { isRetracted } : { isRetracted: false }),
        };
        const orderBy = {};
        if (sortBy === 'amount') {
            orderBy.amount = sortOrder;
        }
        else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        }
        else {
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
            data: bids.map((bid) => bid_response_dto_1.BidResponseDto.fromEntity(bid)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
};
exports.BidService = BidService;
exports.BidService = BidService = BidService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [bid_repository_1.BidRepository,
        auction_repository_1.AuctionRepository,
        prisma_service_1.PrismaService])
], BidService);
//# sourceMappingURL=bid.service.js.map