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
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const order_repository_1 = require("./repositories/order.repository");
const order_response_dto_1 = require("./dto/order-response.dto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const product_repository_1 = require("../product/repositories/product.repository");
const auction_repository_1 = require("../auction/repositories/auction.repository");
let OrderService = OrderService_1 = class OrderService {
    orderRepository;
    productRepository;
    auctionRepository;
    prisma;
    logger = new common_1.Logger(OrderService_1.name);
    constructor(orderRepository, productRepository, auctionRepository, prisma) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;
        this.prisma = prisma;
    }
    async createOrder(dto, buyerId) {
        const product = await this.productRepository.findById(dto.productId);
        if (!product || product.deletedAt) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Product is not available for purchase');
        }
        if (product.sellerId === buyerId) {
            throw new common_1.ForbiddenException('You cannot purchase your own product');
        }
        let auction = null;
        if (dto.auctionId) {
            auction = await this.auctionRepository.findById(dto.auctionId);
            if (!auction || auction.deletedAt) {
                throw new common_1.NotFoundException('Auction not found');
            }
            if (auction.productId !== dto.productId) {
                throw new common_1.BadRequestException('Auction does not match the product');
            }
            if (auction.status !== 'ENDED') {
                throw new common_1.BadRequestException('Order can only be created from ended auctions');
            }
            if (auction.winnerId !== buyerId) {
                throw new common_1.ForbiddenException('Only the auction winner can create an order');
            }
        }
        const orderNumber = await this.orderRepository.generateOrderNumber();
        const amount = dto.amount;
        if (auction) {
            const winningBid = await this.prisma.bid.findFirst({
                where: {
                    auctionId: dto.auctionId,
                    bidderId: buyerId,
                    isWinning: true,
                    isRetracted: false,
                },
                orderBy: {
                    amount: 'desc',
                },
            });
            if (winningBid && Number(winningBid.amount) !== amount) {
                throw new common_1.BadRequestException(`Order amount must match winning bid amount: ${Number(winningBid.amount)}`);
            }
        }
        else {
            if (Number(product.price) !== amount) {
                throw new common_1.BadRequestException(`Order amount must match product price: ${Number(product.price)}`);
            }
        }
        const order = await this.prisma.$transaction(async (tx) => {
            if (dto.auctionId) {
                const existingOrder = await tx.order.findFirst({
                    where: {
                        auctionId: dto.auctionId,
                        buyerId,
                        status: {
                            not: 'CANCELLED',
                        },
                        deletedAt: null,
                    },
                });
                if (existingOrder) {
                    throw new common_1.ConflictException('Order already exists for this auction');
                }
            }
            else {
                const existingPendingOrder = await tx.order.findFirst({
                    where: {
                        productId: dto.productId,
                        buyerId,
                        status: 'PENDING',
                        deletedAt: null,
                    },
                });
                if (existingPendingOrder) {
                    throw new common_1.ConflictException('You already have a pending purchase request for this product');
                }
            }
            return tx.order.create({
                data: {
                    orderNumber,
                    buyer: {
                        connect: { id: buyerId },
                    },
                    product: {
                        connect: { id: dto.productId },
                    },
                    auction: dto.auctionId
                        ? {
                            connect: { id: dto.auctionId },
                        }
                        : undefined,
                    amount,
                    status: client_1.OrderStatus.PENDING,
                    paymentStatus: client_1.PaymentStatus.PENDING,
                    shippingAddress: dto.shippingAddress,
                    notes: dto.notes,
                },
            });
        });
        this.logger.log(`Order created: ${order.id} (${orderNumber}) for product ${dto.productId} by user ${buyerId}. Amount: ${amount}`);
        if (!dto.auctionId) {
            this.logger.log(`Purchase request created for product ${dto.productId}. Seller: ${product.sellerId}`);
        }
        return this.findById(order.id);
    }
    async findAll(query, userId, userRole) {
        const { page = 1, limit = 20, buyerId, productId, auctionId, status, paymentStatus, createdAfter, createdBefore, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {
            deletedAt: null,
        };
        if (buyerId) {
            where.buyerId = buyerId;
        }
        else if (userId && userRole !== client_1.UserRole.ADMIN) {
            const userProducts = await this.prisma.product.findMany({
                where: {
                    sellerId: userId,
                    deletedAt: null,
                },
                select: { id: true },
            });
            const productIds = userProducts.map((p) => p.id);
            where.OR = [
                { buyerId: userId },
                ...(productIds.length > 0 ? [{ productId: { in: productIds } }] : []),
            ];
        }
        if (productId) {
            where.productId = productId;
        }
        if (auctionId) {
            where.auctionId = auctionId;
        }
        if (status) {
            where.status = status;
        }
        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }
        if (createdAfter || createdBefore) {
            where.createdAt = {};
            if (createdAfter) {
                where.createdAt.gte = new Date(createdAfter);
            }
            if (createdBefore) {
                where.createdAt.lte = new Date(createdBefore);
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
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: maxLimit,
                orderBy,
                include: {
                    buyer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phoneNumber: true,
                        },
                    },
                    product: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            price: true,
                            sellerId: true,
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
                    auction: {
                        select: {
                            id: true,
                            productId: true,
                            status: true,
                        },
                    },
                },
            }),
            this.orderRepository.count({ where }),
        ]);
        const sellerIds = [
            ...new Set(orders
                .map((order) => order.product?.sellerId)
                .filter((id) => Boolean(id))),
        ];
        const sellers = await this.prisma.user.findMany({
            where: {
                id: { in: sellerIds },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
            },
        });
        const sellerMap = new Map(sellers.map((seller) => [seller.id, seller]));
        const ordersWithSeller = orders.map((order) => {
            const seller = order.product?.sellerId
                ? sellerMap.get(order.product.sellerId)
                : undefined;
            return { ...order, seller };
        });
        return {
            data: ordersWithSeller.map((order) => order_response_dto_1.OrderResponseDto.fromEntity(order)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async findById(id, userId, userRole) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                buyer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        price: true,
                        sellerId: true,
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
                        seller: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phoneNumber: true,
                            },
                        },
                    },
                },
                auction: {
                    select: {
                        id: true,
                        productId: true,
                        status: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        if (order.deletedAt) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        if (userId && userRole !== client_1.UserRole.ADMIN) {
            if (order.buyerId !== userId && order.product.sellerId !== userId) {
                throw new common_1.ForbiddenException('You can only view your own orders or orders for your products');
            }
        }
        return order_response_dto_1.OrderResponseDto.fromEntity({
            ...order,
            seller: order.product.seller ?? undefined,
        });
    }
    async updateOrder(id, dto, userId, userRole) {
        const order = await this.orderRepository.findById(id);
        if (!order || order.deletedAt) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        const product = await this.productRepository.findById(order.productId);
        if (!product || product.deletedAt) {
            throw new common_1.NotFoundException('Product not found');
        }
        const isBuyer = order.buyerId === userId;
        const isSeller = product.sellerId === userId;
        const isAdmin = userRole === client_1.UserRole.ADMIN;
        if (!isBuyer && !isSeller && !isAdmin) {
            throw new common_1.ForbiddenException('You can only update your own orders or orders for your products');
        }
        const updateData = {};
        if (dto.status !== undefined) {
            this.validateStatusTransition(order.status, dto.status);
            if (order.status === 'CANCELLED' && dto.status !== 'CANCELLED') {
                throw new common_1.BadRequestException('Cannot change status of cancelled order');
            }
            if (order.status === 'DELIVERED' && dto.status !== 'DELIVERED') {
                throw new common_1.BadRequestException('Cannot change status of delivered order');
            }
            if (dto.status === 'CONFIRMED' && !isSeller && !isAdmin) {
                throw new common_1.ForbiddenException('Only seller can confirm purchase requests');
            }
            if (dto.status === 'SHIPPED' && !isSeller && !isAdmin) {
                throw new common_1.ForbiddenException('Only seller can mark order as shipped');
            }
            if (dto.status === 'DELIVERED' && !isSeller && !isAdmin) {
                throw new common_1.ForbiddenException('Only seller can mark order as delivered');
            }
            if (dto.status === 'CANCELLED') {
                updateData.cancelledAt = new Date();
                updateData.cancelledBy = userId;
                if (dto.cancellationReason) {
                    updateData.cancellationReason = dto.cancellationReason;
                }
            }
            if (dto.status === 'DELIVERED') {
                updateData.deliveredAt = new Date();
                updateData.completedAt = new Date();
            }
            updateData.status = dto.status;
        }
        if (dto.paymentStatus !== undefined) {
            if (dto.paymentStatus === 'COMPLETED') {
                updateData.paymentStatus = dto.paymentStatus;
            }
            else {
                updateData.paymentStatus = dto.paymentStatus;
            }
        }
        if (dto.shippingAddress !== undefined) {
            if (!isBuyer && !isAdmin) {
                throw new common_1.ForbiddenException('Only buyer can update shipping address');
            }
            updateData.shippingAddress = dto.shippingAddress;
        }
        if (dto.notes !== undefined) {
            updateData.notes = dto.notes;
        }
        if (dto.shippedAt !== undefined) {
            if (!isSeller && !isAdmin) {
                throw new common_1.ForbiddenException('Only seller can update shipped date');
            }
            updateData.shippedAt = new Date(dto.shippedAt);
            if (order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
                updateData.status = 'SHIPPED';
            }
        }
        if (dto.deliveredAt !== undefined) {
            if (!isSeller && !isAdmin) {
                throw new common_1.ForbiddenException('Only seller can update delivered date');
            }
            updateData.deliveredAt = new Date(dto.deliveredAt);
            updateData.completedAt = new Date(dto.deliveredAt);
            if (order.status !== 'DELIVERED') {
                updateData.status = 'DELIVERED';
            }
        }
        if (dto.cancellationReason !== undefined && dto.status === 'CANCELLED') {
            updateData.cancellationReason = dto.cancellationReason;
        }
        await this.orderRepository.update(id, updateData);
        this.logger.log(`Order ${id} updated by ${isBuyer ? 'buyer' : isSeller ? 'seller' : 'admin'}. Status: ${dto.status ?? order.status}`);
        return this.findById(id);
    }
    async deleteOrder(id, userId, userRole) {
        const order = await this.orderRepository.findById(id);
        if (!order || order.deletedAt) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        const product = await this.productRepository.findById(order.productId);
        if (!product || product.deletedAt) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (order.buyerId !== userId &&
            product.sellerId !== userId &&
            userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own orders or orders for your products');
        }
        if (order.status === 'DELIVERED') {
            throw new common_1.BadRequestException('Cannot delete delivered orders');
        }
        await this.orderRepository.softDelete(id, userId);
        this.logger.log(`Order ${id} deleted by user ${userId}`);
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            PENDING: ['CONFIRMED', 'CANCELLED', 'PROCESSING'],
            CONFIRMED: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
            PROCESSING: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED', 'CANCELLED'],
            DELIVERED: [],
            CANCELLED: [],
        };
        const allowedStatuses = validTransitions[currentStatus] ?? [];
        if (!allowedStatuses.includes(newStatus) && currentStatus !== newStatus) {
            throw new common_1.BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedStatuses.join(', ')}`);
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [order_repository_1.OrderRepository,
        product_repository_1.ProductRepository,
        auction_repository_1.AuctionRepository,
        prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map