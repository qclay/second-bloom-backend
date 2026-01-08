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
var ReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const review_repository_1 = require("./repositories/review.repository");
const review_response_dto_1 = require("./dto/review-response.dto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const order_repository_1 = require("../order/repositories/order.repository");
const product_repository_1 = require("../product/repositories/product.repository");
let ReviewService = ReviewService_1 = class ReviewService {
    reviewRepository;
    orderRepository;
    productRepository;
    prisma;
    logger = new common_1.Logger(ReviewService_1.name);
    constructor(reviewRepository, orderRepository, productRepository, prisma) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.prisma = prisma;
    }
    async createReview(dto, reviewerId) {
        if (dto.revieweeId === reviewerId) {
            throw new common_1.BadRequestException('You cannot review yourself');
        }
        const reviewee = await this.prisma.user.findUnique({
            where: { id: dto.revieweeId },
            select: { id: true },
        });
        if (!reviewee) {
            throw new common_1.NotFoundException('Reviewee not found');
        }
        if (dto.parentId) {
            const parentReview = await this.reviewRepository.findById(dto.parentId);
            if (!parentReview) {
                throw new common_1.NotFoundException('Parent review not found');
            }
            if (parentReview.parentId) {
                throw new common_1.BadRequestException('Cannot reply to a reply');
            }
            if (parentReview.reviewerId === reviewerId) {
                throw new common_1.BadRequestException('You cannot reply to your own review');
            }
        }
        if (dto.productId) {
            const product = await this.productRepository.findById(dto.productId);
            if (!product || product.deletedAt) {
                throw new common_1.NotFoundException('Product not found');
            }
            if (product.sellerId !== dto.revieweeId) {
                throw new common_1.BadRequestException('Reviewee must be the seller of the product');
            }
            if (dto.orderId) {
                const order = await this.orderRepository.findById(dto.orderId);
                if (!order || order.deletedAt) {
                    throw new common_1.NotFoundException('Order not found');
                }
                if (order.buyerId !== reviewerId) {
                    throw new common_1.ForbiddenException('You can only review products from your own orders');
                }
                if (order.productId !== dto.productId) {
                    throw new common_1.BadRequestException('Order does not match product');
                }
                if (order.status !== 'DELIVERED') {
                    throw new common_1.BadRequestException('You can only review products from delivered orders');
                }
            }
            const existingReview = await this.prisma.review.findUnique({
                where: {
                    reviewerId_revieweeId_productId: {
                        reviewerId,
                        revieweeId: dto.revieweeId,
                        productId: dto.productId,
                    },
                },
            });
            if (existingReview && !dto.parentId) {
                throw new common_1.ConflictException('You have already reviewed this product for this seller');
            }
        }
        const review = await this.prisma.$transaction(async (tx) => {
            const createdReview = await tx.review.create({
                data: {
                    reviewer: {
                        connect: { id: reviewerId },
                    },
                    reviewee: {
                        connect: { id: dto.revieweeId },
                    },
                    product: dto.productId
                        ? {
                            connect: { id: dto.productId },
                        }
                        : undefined,
                    parent: dto.parentId
                        ? {
                            connect: { id: dto.parentId },
                        }
                        : undefined,
                    rating: dto.rating,
                    comment: dto.comment,
                    orderId: dto.orderId,
                },
            });
            if (!dto.parentId && dto.revieweeId) {
                await this.updateUserRatingInTransaction(tx, dto.revieweeId);
            }
            return createdReview;
        });
        this.logger.log(`Review created: ${review.id} by user ${reviewerId} for ${dto.revieweeId}`);
        return this.findById(review.id);
    }
    async findAll(query) {
        const { page = 1, limit = 20, reviewerId, revieweeId, productId, parentId, minRating, maxRating, isVerified, isReported, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        const where = {};
        if (reviewerId) {
            where.reviewerId = reviewerId;
        }
        if (revieweeId) {
            where.revieweeId = revieweeId;
        }
        if (productId) {
            where.productId = productId;
        }
        if (parentId !== undefined) {
            where.parentId = parentId;
        }
        else {
            where.parentId = null;
        }
        if (minRating !== undefined || maxRating !== undefined) {
            where.rating = {};
            if (minRating !== undefined) {
                where.rating.gte = minRating;
            }
            if (maxRating !== undefined) {
                where.rating.lte = maxRating;
            }
        }
        if (isVerified !== undefined) {
            where.isVerified = isVerified;
        }
        if (isReported !== undefined) {
            where.isReported = isReported;
        }
        const orderBy = {};
        if (sortBy === 'rating') {
            orderBy.rating = sortOrder;
        }
        else if (sortBy === 'helpfulCount') {
            orderBy.helpfulCount = sortOrder;
        }
        else {
            orderBy.createdAt = sortOrder;
        }
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                skip,
                take: maxLimit,
                orderBy,
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phoneNumber: true,
                            avatarId: true,
                        },
                    },
                    reviewee: {
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
                        },
                    },
                    parent: {
                        select: {
                            id: true,
                            rating: true,
                            comment: true,
                        },
                    },
                    replies: {
                        include: {
                            reviewer: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    phoneNumber: true,
                                    avatarId: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            }),
            this.reviewRepository.count({ where }),
        ]);
        return {
            data: reviews.map((review) => review_response_dto_1.ReviewResponseDto.fromEntity(review)),
            meta: {
                total,
                page,
                limit: maxLimit,
                totalPages: Math.ceil(total / maxLimit),
            },
        };
    }
    async findById(id) {
        const review = await this.prisma.review.findUnique({
            where: { id },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                        avatarId: true,
                    },
                },
                reviewee: {
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
                    },
                },
                parent: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                    },
                },
                replies: {
                    include: {
                        reviewer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                phoneNumber: true,
                                avatarId: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID ${id} not found`);
        }
        return review_response_dto_1.ReviewResponseDto.fromEntity(review);
    }
    async updateReview(id, dto, userId, userRole) {
        const review = await this.reviewRepository.findById(id);
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID ${id} not found`);
        }
        if (review.reviewerId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only update your own reviews');
        }
        if (review.parentId && dto.rating !== undefined) {
            throw new common_1.BadRequestException('Replies cannot have ratings');
        }
        const updateData = {};
        if (dto.rating !== undefined) {
            updateData.rating = dto.rating;
        }
        if (dto.comment !== undefined) {
            updateData.comment = dto.comment;
        }
        if (dto.isReported !== undefined && userRole === client_1.UserRole.ADMIN) {
            updateData.isReported = dto.isReported;
            if (dto.isReported) {
                updateData.reportedAt = new Date();
                updateData.reportReason = dto.reportReason ?? null;
            }
            else {
                updateData.reportedAt = null;
                updateData.reportReason = null;
            }
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.review.update({
                where: { id },
                data: updateData,
            });
            if (dto.rating !== undefined && !review.parentId) {
                await this.updateUserRatingInTransaction(tx, review.revieweeId);
            }
        });
        this.logger.log(`Review ${id} updated by user ${userId}`);
        return this.findById(id);
    }
    async deleteReview(id, userId, userRole) {
        const review = await this.reviewRepository.findById(id);
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID ${id} not found`);
        }
        if (review.reviewerId !== userId && userRole !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        const revieweeId = review.revieweeId;
        const isParentReview = !review.parentId;
        await this.prisma.$transaction(async (tx) => {
            await tx.review.delete({
                where: { id },
            });
            if (isParentReview) {
                await this.updateUserRatingInTransaction(tx, revieweeId);
            }
        });
        this.logger.log(`Review ${id} deleted by user ${userId}`);
    }
    async markHelpful(id, userId) {
        const review = await this.reviewRepository.findById(id);
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID ${id} not found`);
        }
        await this.reviewRepository.incrementHelpfulCount(id);
        this.logger.log(`Review ${id} marked as helpful by user ${userId}`);
        return this.findById(id);
    }
    async updateUserRating(userId) {
        await this.updateUserRatingInTransaction(this.prisma, userId);
    }
    async updateUserRatingInTransaction(tx, userId) {
        const reviews = await tx.review.findMany({
            where: {
                revieweeId: userId,
                parentId: null,
            },
            select: {
                rating: true,
            },
        });
        if (reviews.length === 0) {
            await tx.user.update({
                where: { id: userId },
                data: {
                    rating: 0,
                    totalRatings: 0,
                },
            });
            return;
        }
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        await tx.user.update({
            where: { id: userId },
            data: {
                rating: averageRating,
                totalRatings: reviews.length,
            },
        });
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = ReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [review_repository_1.ReviewRepository,
        order_repository_1.OrderRepository,
        product_repository_1.ProductRepository,
        prisma_service_1.PrismaService])
], ReviewService);
//# sourceMappingURL=review.service.js.map