import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ReviewRepository } from './repositories/review.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderRepository } from '../order/repositories/order.repository';
import { ProductRepository } from '../product/repositories/product.repository';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createReview(
    dto: CreateReviewDto,
    reviewerId: string,
  ): Promise<ReviewResponseDto> {
    if (dto.revieweeId === reviewerId) {
      throw new BadRequestException('You cannot review yourself');
    }

    const reviewee = await this.prisma.user.findUnique({
      where: { id: dto.revieweeId },
      select: { id: true },
    });

    if (!reviewee) {
      throw new NotFoundException('Reviewee not found');
    }

    if (dto.parentId) {
      const parentReview = await this.reviewRepository.findById(dto.parentId);
      if (!parentReview) {
        throw new NotFoundException('Parent review not found');
      }

      if (parentReview.parentId) {
        throw new BadRequestException('Cannot reply to a reply');
      }

      if (parentReview.reviewerId === reviewerId) {
        throw new BadRequestException('You cannot reply to your own review');
      }
    }

    if (dto.productId) {
      const product = await this.productRepository.findById(dto.productId);
      if (!product || product.deletedAt) {
        throw new NotFoundException('Product not found');
      }

      if (product.sellerId !== dto.revieweeId) {
        throw new BadRequestException(
          'Reviewee must be the seller of the product',
        );
      }

      if (dto.orderId) {
        const order = await this.orderRepository.findById(dto.orderId);
        if (!order || order.deletedAt) {
          throw new NotFoundException('Order not found');
        }

        if (order.buyerId !== reviewerId) {
          throw new ForbiddenException(
            'You can only review products from your own orders',
          );
        }

        if (order.productId !== dto.productId) {
          throw new BadRequestException('Order does not match product');
        }

        if (order.status !== 'DELIVERED') {
          throw new BadRequestException(
            'You can only review products from delivered orders',
          );
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
        throw new ConflictException(
          'You have already reviewed this product for this seller',
        );
      }
    }

    const review = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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
      },
    );

    this.logger.log(
      `Review created: ${review.id} by user ${reviewerId} for ${dto.revieweeId}`,
    );

    return this.findById(review.id);
  }

  async findAll(query: ReviewQueryDto) {
    const {
      page = 1,
      limit = 20,
      reviewerId,
      revieweeId,
      productId,
      parentId,
      minRating,
      maxRating,
      isVerified,
      isReported,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.ReviewWhereInput = {};

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
    } else {
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

    const orderBy: Prisma.ReviewOrderByWithRelationInput = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else {
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
      data: reviews.map((review) => ReviewResponseDto.fromEntity(review)),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async findById(id: string): Promise<ReviewResponseDto> {
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
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return ReviewResponseDto.fromEntity(review);
  }

  async updateReview(
    id: string,
    dto: UpdateReviewDto,
    userId: string,
    userRole: UserRole,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.reviewerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    if (review.parentId && dto.rating !== undefined) {
      throw new BadRequestException('Replies cannot have ratings');
    }

    const updateData: Prisma.ReviewUpdateInput = {};

    if (dto.rating !== undefined) {
      updateData.rating = dto.rating;
    }

    if (dto.comment !== undefined) {
      updateData.comment = dto.comment;
    }

    if (dto.isReported !== undefined && userRole === UserRole.ADMIN) {
      updateData.isReported = dto.isReported;
      if (dto.isReported) {
        updateData.reportedAt = new Date();
        updateData.reportReason = dto.reportReason ?? null;
      } else {
        updateData.reportedAt = null;
        updateData.reportReason = null;
      }
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

  async deleteReview(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.reviewerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const revieweeId = review.revieweeId;
    const isParentReview = !review.parentId;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.review.delete({
        where: { id },
      });

      if (isParentReview) {
        await this.updateUserRatingInTransaction(tx, revieweeId);
      }
    });

    this.logger.log(`Review ${id} deleted by user ${userId}`);
  }

  private async updateUserRating(userId: string): Promise<void> {
    await this.updateUserRatingInTransaction(this.prisma, userId);
  }

  private async updateUserRatingInTransaction(
    tx: Prisma.TransactionClient | PrismaService,
    userId: string,
  ): Promise<void> {
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
}
