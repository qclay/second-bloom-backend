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
exports.PaymentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PaymentRepository = class PaymentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.payment.findUnique({
            where: { id },
        });
    }
    async findByTransactionId(transactionId) {
        return this.prisma.payment.findUnique({
            where: { transactionId },
        });
    }
    async findByGatewayTransactionId(gatewayTransactionId, gateway) {
        return this.prisma.payment.findFirst({
            where: {
                gatewayTransactionId,
                gateway: gateway,
            },
        });
    }
    async create(data) {
        return this.prisma.payment.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.payment.update({
            where: { id },
            data,
        });
    }
    async findMany(args) {
        return this.prisma.payment.findMany(args);
    }
    async count(args) {
        return this.prisma.payment.count(args);
    }
};
exports.PaymentRepository = PaymentRepository;
exports.PaymentRepository = PaymentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentRepository);
//# sourceMappingURL=payment.repository.js.map