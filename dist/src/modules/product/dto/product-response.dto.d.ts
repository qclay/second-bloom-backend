import { Product, ProductImage } from '@prisma/client';
export declare class ProductImageResponseDto {
    id: string;
    fileId: string;
    order: number;
    createdAt: Date;
    url?: string;
    static fromEntity(image: ProductImage & {
        file?: {
            url: string;
        };
    }): ProductImageResponseDto;
}
export declare class ProductResponseDto {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    currency: string;
    categoryId: string;
    tags: string[];
    type: string;
    condition: string | null;
    quantity: number;
    status: string;
    isFeatured: boolean;
    views: number;
    region: string | null;
    city: string | null;
    district: string | null;
    sellerId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    seller?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
    };
    images?: ProductImageResponseDto[];
    static fromEntity(product: Product & {
        category?: {
            id: string;
            name: string;
            slug: string;
        };
        seller?: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string;
        };
        images?: (ProductImage & {
            file?: {
                url: string;
            };
        })[];
    }): ProductResponseDto;
}
