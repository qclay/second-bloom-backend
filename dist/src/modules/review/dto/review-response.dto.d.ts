import { Review } from '@prisma/client';
export declare class ReviewResponseDto {
    id: string;
    reviewerId: string;
    revieweeId: string;
    productId: string | null;
    orderId: string | null;
    parentId: string | null;
    rating: number;
    comment: string | null;
    isVerified: boolean;
    isReported: boolean;
    reportReason: string | null;
    reportedAt: Date | null;
    helpfulCount: number;
    createdAt: Date;
    updatedAt: Date;
    reviewer?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
        avatarId: string | null;
    };
    reviewee?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
    };
    product?: {
        id: string;
        title: string;
        slug: string;
    } | null;
    replies?: ReviewResponseDto[];
    parent?: {
        id: string;
        rating: number;
        comment: string | null;
    } | null;
    static fromEntity(review: Review & {
        reviewer?: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
            avatarId: string | null;
        };
        reviewee?: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
        };
        product?: {
            id: string;
            title: string;
            slug: string;
        } | null;
        parent?: {
            id: string;
            rating: number;
            comment: string | null;
        } | null;
        replies?: Array<Review & {
            reviewer?: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                phoneNumber: string;
                avatarId: string | null;
            };
        }>;
    }): ReviewResponseDto;
}
