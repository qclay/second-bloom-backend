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
exports.ProductRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ProductRepository = class ProductRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.product.findUnique({
            where: { id },
        });
    }
    async findBySlug(slug) {
        return this.prisma.product.findUnique({
            where: { slug },
        });
    }
    async create(data) {
        return this.prisma.product.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }
    async softDelete(id, deletedBy) {
        return this.prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy,
                status: 'INACTIVE',
            },
        });
    }
    async findMany(args) {
        return this.prisma.product.findMany(args);
    }
    async count(args) {
        return this.prisma.product.count(args);
    }
    async incrementViews(id) {
        return this.prisma.product.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
    }
};
exports.ProductRepository = ProductRepository;
exports.ProductRepository = ProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductRepository);
//# sourceMappingURL=product.repository.js.map