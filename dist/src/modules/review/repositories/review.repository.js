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
exports.ReviewRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ReviewRepository = class ReviewRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.review.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma.review.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.review.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.review.delete({
            where: { id },
        });
    }
    async findMany(args) {
        return this.prisma.review.findMany(args);
    }
    async count(args) {
        return this.prisma.review.count(args);
    }
    async findReplies(parentId) {
        return this.prisma.review.findMany({
            where: { parentId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async incrementHelpfulCount(id) {
        return this.prisma.review.update({
            where: { id },
            data: {
                helpfulCount: {
                    increment: 1,
                },
            },
        });
    }
};
exports.ReviewRepository = ReviewRepository;
exports.ReviewRepository = ReviewRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewRepository);
//# sourceMappingURL=review.repository.js.map