import { ProductType, ProductStatus } from '@prisma/client';
export declare class ProductSearchDto {
    search?: string;
    categoryId?: string;
    categoryIds?: string[];
    sellerId?: string;
    sellerIds?: string[];
    isFeatured?: boolean;
    type?: ProductType;
    types?: ProductType[];
    status?: ProductStatus;
    statuses?: ProductStatus[];
    region?: string;
    regions?: string[];
    city?: string;
    cities?: string[];
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
