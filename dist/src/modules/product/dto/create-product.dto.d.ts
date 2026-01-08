import { ProductType, ProductCondition, ProductStatus } from '@prisma/client';
export declare class CreateProductDto {
    title: string;
    description?: string;
    price: number;
    currency?: string;
    categoryId: string;
    tags?: string[];
    type?: ProductType;
    condition?: ProductCondition;
    quantity?: number;
    status?: ProductStatus;
    isFeatured?: boolean;
    region?: string;
    city?: string;
    district?: string;
    imageIds?: string[];
}
