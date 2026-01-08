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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const payment_repository_1 = require("./repositories/payment.repository");
const payment_response_dto_1 = require("./dto/payment-response.dto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const payment_service_1 = require("../../infrastructure/payment/payment.service");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
let PaymentService = PaymentService_1 = class PaymentService {
    paymentRepository;
    prisma;
    infrastructurePaymentService;
    configService;
    logger = new common_1.Logger(PaymentService_1.name);
    publicationPrice;
    constructor(paymentRepository, prisma, infrastructurePaymentService, configService) {
        this.paymentRepository = paymentRepository;
        this.prisma = prisma;
        this.infrastructurePaymentService = infrastructurePaymentService;
        this.configService = configService;
        this.publicationPrice = this.configService.get('PUBLICATION_PRICE', 30000);
    }
    async findAll(query, userId, userRole) {
        const { page = 1, limit = 20, status, method, gateway, transactionId, paidAfter, paidBefore, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {};
        if (userId && userRole !== client_1.UserRole.ADMIN) {
            where.userId = userId;
        }
        if (status) {
            where.status = status;
        }
        if (method) {
            where.method = method;
        }
        if (gateway) {
            where.gateway = gateway;
        }
        if (transactionId) {
            where.transactionId = transactionId;
        }
        if (paidAfter || paidBefore) {
            where.paidAt = {};
            if (paidAfter) {
                where.paidAt.gte = new Date(paidAfter);
            }
            if (paidBefore) {
                where.paidAt.lte = new Date(paidBefore);
            }
        }
        const orderBy = {};
        if (sortBy === 'amount') {
            orderBy.amount = sortOrder;
        }
        else if (sortBy === 'status') {
            orderBy.status = sortOrder;
        }
        else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [payments, total] = await Promise.all([
            this.paymentRepository.findMany({
                where,
                skip,
                take: maxLimit,
                orderBy,
            }),
            this.paymentRepository.count({ where }),
        ]);
        return {
            data: payments.map((payment) => payment_response_dto_1.PaymentResponseDto.fromEntity(payment)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async findById(id, userId, userRole = client_1.UserRole.USER) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        if (userId && userRole !== client_1.UserRole.ADMIN) {
            if (payment.userId !== userId) {
                throw new common_1.ForbiddenException('You can only view your own payments');
            }
        }
        return payment_response_dto_1.PaymentResponseDto.fromEntity(payment);
    }
    async verifyPayment(id, userId, userRole = client_1.UserRole.USER) {
        const payment = await this.paymentRepository.findById(id);
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        if (payment.userId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only verify your own payments');
        }
        if (payment.status === client_1.PaymentStatus.COMPLETED) {
            return this.findById(id);
        }
        if (!payment.gateway || !payment.gatewayTransactionId) {
            throw new common_1.BadRequestException('Payment does not have a gateway. Cannot verify.');
        }
        this.logger.log(`Verifying payment ${id} via gateway ${payment.gateway}`);
        await this.paymentRepository.update(id, {
            status: client_1.PaymentStatus.PROCESSING,
        });
        try {
            const verified = await this.infrastructurePaymentService.verifyPayment(payment.transactionId, payment.gateway, payment.gatewayTransactionId);
            if (verified) {
                await this.prisma.payment.update({
                    where: { id },
                    data: {
                        status: client_1.PaymentStatus.COMPLETED,
                        paidAt: new Date(),
                    },
                });
                if (payment.paymentType === 'PUBLICATION') {
                    await this.prisma.user.update({
                        where: { id: payment.userId },
                        data: {
                            publicationCredits: {
                                increment: payment.quantity,
                            },
                        },
                    });
                }
                if (payment.paymentType === 'TOP_UP') {
                    await this.prisma.user.update({
                        where: { id: payment.userId },
                        data: {
                            balance: {
                                increment: payment.amount,
                            },
                        },
                    });
                }
                this.logger.log(`Payment ${id} verified and completed`);
            }
            else {
                await this.paymentRepository.update(id, {
                    status: client_1.PaymentStatus.FAILED,
                });
                this.logger.warn(`Payment ${id} verification failed`);
            }
        }
        catch (error) {
            this.logger.error(`Error verifying payment ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            await this.paymentRepository.update(id, {
                status: client_1.PaymentStatus.FAILED,
            });
        }
        return this.findById(id);
    }
    async handleWebhook(gateway, payload, headers) {
        this.logger.log(`Received webhook from ${gateway}: ${JSON.stringify(payload)}`);
        try {
            const isValid = this.infrastructurePaymentService.verifyWebhook(gateway, payload, headers);
            if (!isValid) {
                this.logger.warn(`Invalid webhook signature from ${gateway}`);
                return;
            }
            const webhookResult = await this.infrastructurePaymentService.processWebhook(gateway, payload);
            let payment = null;
            if (webhookResult.transactionId) {
                payment = await this.paymentRepository.findByTransactionId(webhookResult.transactionId);
            }
            if (!payment && webhookResult.gatewayTransactionId) {
                payment = await this.paymentRepository.findByGatewayTransactionId(webhookResult.gatewayTransactionId, gateway);
            }
            if (!payment) {
                this.logger.warn(`Payment not found for transaction ${webhookResult.transactionId ?? 'N/A'}, gateway transaction ${webhookResult.gatewayTransactionId ?? 'N/A'}`);
                return;
            }
            if (payment.status === client_1.PaymentStatus.COMPLETED) {
                this.logger.warn(`Payment ${payment.id} already completed. Ignoring webhook.`);
                return;
            }
            if (webhookResult.status === 'COMPLETED') {
                await this.prisma.$transaction(async (tx) => {
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: client_1.PaymentStatus.COMPLETED,
                            paidAt: new Date(),
                            gatewayTransactionId: webhookResult.gatewayTransactionId ||
                                payment.gatewayTransactionId,
                            webhookData: JSON.parse(JSON.stringify(payload)),
                        },
                    });
                    if (payment.paymentType === 'PUBLICATION') {
                        await tx.user.update({
                            where: { id: payment.userId },
                            data: {
                                publicationCredits: {
                                    increment: payment.quantity,
                                },
                            },
                        });
                    }
                    if (payment.paymentType === 'TOP_UP') {
                        await tx.user.update({
                            where: { id: payment.userId },
                            data: {
                                balance: {
                                    increment: payment.amount,
                                },
                            },
                        });
                    }
                });
                this.logger.log(`Payment ${payment.id} completed via webhook from ${gateway}`);
            }
            else if (webhookResult.status === 'FAILED') {
                await this.paymentRepository.update(payment.id, {
                    status: client_1.PaymentStatus.FAILED,
                    webhookData: JSON.parse(JSON.stringify(payload)),
                });
                this.logger.log(`Payment ${payment.id} failed via webhook from ${gateway}`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing webhook from ${gateway}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createTopUpPayment(userId, amount, method, gateway) {
        const transactionId = (0, uuid_1.v4)();
        let gatewayResult;
        const payment = await this.prisma.$transaction(async (tx) => {
            if (gateway) {
                try {
                    gatewayResult =
                        await this.infrastructurePaymentService.initiatePayment(amount, `topup-${userId}-${transactionId}`, gateway, transactionId);
                    this.logger.log(`Top-up payment gateway initiated: ${gateway} for transaction ${transactionId}`);
                }
                catch (error) {
                    this.logger.error(`Failed to initiate top-up payment gateway: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    throw new common_1.BadRequestException(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            return tx.payment.create({
                data: {
                    userId,
                    paymentType: 'TOP_UP',
                    amount,
                    quantity: 1,
                    method,
                    gateway: gateway ?? null,
                    transactionId,
                    gatewayTransactionId: gatewayResult?.gatewayTransactionId ?? null,
                    gatewayOrderId: gatewayResult?.gatewayOrderId ?? null,
                    gatewayResponse: gatewayResult
                        ? JSON.parse(JSON.stringify(gatewayResult))
                        : undefined,
                    status: client_1.PaymentStatus.PENDING,
                },
            });
        });
        this.logger.log(`Top-up payment created: ${payment.id} for user ${userId}. Amount: ${amount}, Method: ${method}, Gateway: ${gateway ?? 'N/A'}`);
        return this.findById(payment.id);
    }
    async createPublicationPayment(userId, amount, quantity, method, gateway) {
        const transactionId = (0, uuid_1.v4)();
        let gatewayResult;
        const payment = await this.prisma.$transaction(async (tx) => {
            if (gateway) {
                try {
                    gatewayResult =
                        await this.infrastructurePaymentService.initiatePayment(amount, `publication-${userId}-${transactionId}`, gateway, transactionId);
                    this.logger.log(`Publication payment gateway initiated: ${gateway} for transaction ${transactionId}`);
                }
                catch (error) {
                    this.logger.error(`Failed to initiate publication payment gateway: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    throw new common_1.BadRequestException(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            return tx.payment.create({
                data: {
                    userId,
                    paymentType: 'PUBLICATION',
                    amount,
                    quantity,
                    method,
                    gateway: gateway ?? null,
                    transactionId,
                    gatewayTransactionId: gatewayResult?.gatewayTransactionId ?? null,
                    gatewayOrderId: gatewayResult?.gatewayOrderId ?? null,
                    gatewayResponse: gatewayResult
                        ? JSON.parse(JSON.stringify(gatewayResult))
                        : undefined,
                    status: client_1.PaymentStatus.PENDING,
                },
            });
        });
        this.logger.log(`Publication payment created: ${payment.id} for user ${userId}. Amount: ${amount}, Quantity: ${quantity}, Method: ${method}, Gateway: ${gateway ?? 'N/A'}`);
        return this.findById(payment.id);
    }
    async generatePaymentUrl(paymentId) {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (!payment.gatewayOrderId) {
            throw new common_1.BadRequestException('Payment does not have gateway order ID');
        }
        if (payment.gatewayResponse &&
            typeof payment.gatewayResponse === 'object') {
            const response = payment.gatewayResponse;
            if (response.paymentUrl && typeof response.paymentUrl === 'string') {
                return response.paymentUrl;
            }
            if (response.redirectUrl && typeof response.redirectUrl === 'string') {
                return response.redirectUrl;
            }
        }
        throw new common_1.BadRequestException('Payment URL not available');
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
    async buyPublications(userId, quantity, method, gateway) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        if (method === client_1.PaymentMethod.CARD && !gateway) {
            throw new common_1.BadRequestException('Gateway is required for card payments');
        }
        const totalAmount = this.publicationPrice * quantity;
        if (method === client_1.PaymentMethod.BALANCE) {
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
                            increment: quantity,
                        },
                    },
                });
                await tx.payment.create({
                    data: {
                        userId,
                        paymentType: client_1.PaymentType.PUBLICATION,
                        amount: totalAmount,
                        quantity,
                        method,
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
        const payment = await this.createPublicationPayment(userId, totalAmount, quantity, method, gateway);
        let paymentUrl;
        if (gateway && payment.gatewayOrderId) {
            paymentUrl = await this.generatePaymentUrl(payment.id);
        }
        return {
            paymentId: payment.id,
            paymentUrl,
            totalAmount,
        };
    }
    getPublicationPrice() {
        return this.publicationPrice;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_repository_1.PaymentRepository,
        prisma_service_1.PrismaService,
        payment_service_1.PaymentService,
        config_1.ConfigService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map