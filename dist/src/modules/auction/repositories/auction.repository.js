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
exports.AuctionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AuctionRepository = class AuctionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.auction.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma.auction.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.auction.update({
            where: { id },
            data,
        });
    }
    async softDelete(id, deletedBy) {
        return this.prisma.auction.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy,
                status: 'CANCELLED',
            },
        });
    }
    async findMany(args) {
        return this.prisma.auction.findMany(args);
    }
    async count(args) {
        return this.prisma.auction.count(args);
    }
    async incrementViews(id) {
        return this.prisma.auction.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
    }
    async incrementBids(id) {
        return this.prisma.auction.update({
            where: { id },
            data: {
                totalBids: {
                    increment: 1,
                },
            },
        });
    }
    async updateCurrentPrice(id, price) {
        return this.prisma.auction.update({
            where: { id },
            data: {
                currentPrice: price,
                lastBidAt: new Date(),
            },
        });
    }
    async findActiveEndingSoon(seconds) {
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
};
exports.AuctionRepository = AuctionRepository;
exports.AuctionRepository = AuctionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuctionRepository);
//# sourceMappingURL=auction.repository.js.map