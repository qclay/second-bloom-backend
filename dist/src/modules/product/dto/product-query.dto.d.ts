import { ProductType, ProductStatus } from '@prisma/client';
export declare class ProductQueryDto {
    search?: string;
    categoryId?: string;
    sellerId?: string;
    isFeatured?: boolean;
    type?: ProductType;
    status?: ProductStatus;
    region?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
