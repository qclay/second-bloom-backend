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
exports.OrderRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let OrderRepository = class OrderRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.order.findUnique({
            where: { id },
        });
    }
    async findByOrderNumber(orderNumber) {
        return this.prisma.order.findUnique({
            where: { orderNumber },
        });
    }
    async create(data) {
        return this.prisma.order.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.order.update({
            where: { id },
            data,
        });
    }
    async softDelete(id, deletedBy) {
        return this.prisma.order.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy,
                status: 'CANCELLED',
            },
        });
    }
    async findMany(args) {
        return this.prisma.order.findMany(args);
    }
    async count(args) {
        return this.prisma.order.count(args);
    }
    async generateOrderNumber(maxRetries = 10) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const timestamp = Date.now().toString(36).toUpperCase();
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            const orderNumber = `ORD-${timestamp}-${random}`;
            const exists = await this.findByOrderNumber(orderNumber);
            if (!exists) {
                return orderNumber;
            }
        }
        throw new Error(`Failed to generate unique order number after ${maxRetries} attempts`);
    }
};
exports.OrderRepository = OrderRepository;
exports.OrderRepository = OrderRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderRepository);
//# sourceMappingURL=order.repository.js.map