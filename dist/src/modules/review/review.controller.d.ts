import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UserRole } from '@prisma/client';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    create(createReviewDto: CreateReviewDto, userId: string): Promise<ReviewResponseDto>;
    findAll(query: ReviewQueryDto): Promise<{
        data: ReviewResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<ReviewResponseDto>;
    update(id: string, updateReviewDto: UpdateReviewDto, userId: string, role: UserRole): Promise<ReviewResponseDto>;
    remove(id: string, userId: string, role: UserRole): Promise<void>;
    markHelpful(id: string, userId: string): Promise<ReviewResponseDto>;
}
