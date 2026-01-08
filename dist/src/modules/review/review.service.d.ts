import { ReviewRepository } from './repositories/review.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderRepository } from '../order/repositories/order.repository';
import { ProductRepository } from '../product/repositories/product.repository';
export declare class ReviewService {
    private readonly reviewRepository;
    private readonly orderRepository;
    private readonly productRepository;
    private readonly prisma;
    private readonly logger;
    constructor(reviewRepository: ReviewRepository, orderRepository: OrderRepository, productRepository: ProductRepository, prisma: PrismaService);
    createReview(dto: CreateReviewDto, reviewerId: string): Promise<ReviewResponseDto>;
    findAll(query: ReviewQueryDto): Promise<{
        data: ReviewResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<ReviewResponseDto>;
    updateReview(id: string, dto: UpdateReviewDto, userId: string, userRole: UserRole): Promise<ReviewResponseDto>;
    deleteReview(id: string, userId: string, userRole: UserRole): Promise<void>;
    markHelpful(id: string, userId: string): Promise<ReviewResponseDto>;
    private updateUserRating;
    private updateUserRatingInTransaction;
}
