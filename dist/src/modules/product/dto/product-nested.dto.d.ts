import { ProductImageDto } from './product-image.dto';
export declare class ProductNestedDto {
    id: string;
    title: string;
    slug: string;
    price: number;
    images?: ProductImageDto[];
}
