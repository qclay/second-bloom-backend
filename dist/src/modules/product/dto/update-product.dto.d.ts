import { CreateProductDto } from './create-product.dto';
import { ProductType, ProductCondition, ProductStatus } from '@prisma/client';
declare const UpdateProductDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    categoryId?: string;
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
export {};
