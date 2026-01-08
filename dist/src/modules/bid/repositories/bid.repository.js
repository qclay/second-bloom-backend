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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let BidRepository = class BidRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.bid.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma.bid.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.bid.update({
            where: { id },
            data,
        });
    }
    async findMany(args) {
        return this.prisma.bid.findMany(args);
    }
    async count(args) {
        return this.prisma.bid.count(args);
    }
    async findHighestBid(auctionId) {
        return this.prisma.bid.findFirst({
            where: {
                auctionId,
                isRetracted: false,
            },
            orderBy: {
                amount: 'desc',
            },
        });
    }
    async findWinningBid(auctionId) {
        return this.prisma.bid.findFirst({
            where: {
                auctionId,
                isWinning: true,
                isRetracted: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findBidderBids(auctionId, bidderId) {
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
    async updateWinningBids(auctionId, excludeBidId) {
        const where = {
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
};
exports.BidRepository = BidRepository;
exports.BidRepository = BidRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BidRepository);
//# sourceMappingURL=bid.repository.js.map