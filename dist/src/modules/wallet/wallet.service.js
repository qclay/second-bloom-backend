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
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const payment_service_1 = require("../payment/payment.service");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
let WalletService = WalletService_1 = class WalletService {
    prisma;
    paymentService;
    configService;
    logger = new common_1.Logger(WalletService_1.name);
    publicationPrice;
    constructor(prisma, paymentService, configService) {
        this.prisma = prisma;
        this.paymentService = paymentService;
        this.configService = configService;
        this.publicationPrice = this.configService.get('PUBLICATION_PRICE', 30000);
    }
    async getBalance(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                balance: true,
                publicationCredits: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            balance: Number(user.balance),
            publicationCredits: user.publicationCredits,
            currency: 'UZS',
        };
    }
    async getTransactions(userId, page = 1, limit = 20) {
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: { userId },
                skip,
                take: maxLimit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    paymentType: true,
                    amount: true,
                    quantity: true,
                    status: true,
                    method: true,
                    gateway: true,
                    createdAt: true,
                    paidAt: true,
                },
            }),
            this.prisma.payment.count({ where: { userId } }),
        ]);
        return {
            data: payments.map((p) => ({
                id: p.id,
                paymentType: p.paymentType,
                amount: Number(p.amount),
                quantity: p.quantity,
                status: p.status,
                method: p.method,
                gateway: p.gateway,
                createdAt: p.createdAt,
                paidAt: p.paidAt,
            })),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async buyPublications(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        if (dto.method === 'CARD' && !dto.gateway) {
            throw new common_1.BadRequestException('Gateway is required for card payments');
        }
        const totalAmount = this.publicationPrice * dto.quantity;
        if (dto.method === 'BALANCE') {
            if (Number(user.balance) < totalAmount) {
                throw new common_1.BadRequestException(`Insufficient balance. You need ${totalAmount} UZS, but you have ${Number(user.balance)} UZS`);
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        balance: {
                            decrement: totalAmount,
                        },
                        publicationCredits: {
                            increment: dto.quantity,
                        },
                    },
                });
                await tx.payment.create({
                    data: {
                        userId,
                        paymentType: client_1.PaymentType.PUBLICATION,
                        amount: totalAmount,
                        quantity: dto.quantity,
                        method: dto.method,
                        status: client_1.PaymentStatus.COMPLETED,
                        paidAt: new Date(),
                    },
                });
            });
            return {
                paymentId: '',
                totalAmount,
            };
        }
        const payment = await this.paymentService.createPublicationPayment(userId, totalAmount, dto.quantity, dto.method, dto.gateway);
        let paymentUrl;
        if (dto.gateway && payment.gatewayOrderId) {
            paymentUrl = await this.paymentService.generatePaymentUrl(payment.id);
        }
        return {
            paymentId: payment.id,
            paymentUrl,
            totalAmount,
        };
    }
    async usePublicationCredit(userId, productId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                publicationCredits: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.publicationCredits < 1) {
            throw new common_1.BadRequestException('Insufficient publication credits. Please purchase more publications.');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                publicationCredits: {
                    decrement: 1,
                },
            },
        });
        this.logger.log(`User ${userId} used 1 publication credit for product ${productId}`);
    }
    async getTransactionById(transactionId, userId) {
        const payment = await this.paymentService.findById(transactionId, userId);
        return {
            id: payment.id,
            paymentType: payment.paymentType,
            amount: payment.amount,
            quantity: payment.quantity,
            status: payment.status,
            method: payment.method,
            gateway: payment.gateway,
            transactionId: payment.transactionId,
            gatewayTransactionId: payment.gatewayTransactionId,
            gatewayOrderId: payment.gatewayOrderId,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt,
            refundedAt: payment.refundedAt,
        };
    }
    async verifyTransaction(transactionId, userId) {
        const payment = await this.paymentService.verifyPayment(transactionId, userId);
        return {
            id: payment.id,
            paymentType: payment.paymentType,
            amount: payment.amount,
            quantity: payment.quantity,
            status: payment.status,
            method: payment.method,
            gateway: payment.gateway,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt,
        };
    }
    async refundTransaction(transactionId, userId, reason) {
        const payment = await this.paymentService.refundPayment({ paymentId: transactionId, reason }, userId);
        return {
            id: payment.id,
            paymentType: payment.paymentType,
            amount: payment.amount,
            quantity: payment.quantity,
            status: payment.status,
            method: payment.method,
            gateway: payment.gateway,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt,
            refundedAt: payment.refundedAt,
        };
    }
    getPublicationPrice() {
        return this.publicationPrice;
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_service_1.PaymentService,
        config_1.ConfigService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map