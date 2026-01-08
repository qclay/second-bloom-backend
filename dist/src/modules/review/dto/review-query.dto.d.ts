export declare class ReviewQueryDto {
    page?: number;
    limit?: number;
    reviewerId?: string;
    revieweeId?: string;
    productId?: string;
    parentId?: string;
    minRating?: number;
    maxRating?: number;
    isVerified?: boolean;
    isReported?: boolean;
    sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
    sortOrder?: 'asc' | 'desc';
}
