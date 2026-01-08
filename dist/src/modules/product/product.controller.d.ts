import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductSearchDto } from './dto/product-search.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UserRole } from '@prisma/client';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    create(createProductDto: CreateProductDto, userId: string): Promise<ProductResponseDto>;
    findAll(query: ProductQueryDto): Promise<{
        data: ProductResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    search(searchDto: ProductSearchDto): Promise<{
        data: ProductResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findOne(id: string, incrementViews?: string): Promise<ProductResponseDto>;
    update(id: string, updateProductDto: UpdateProductDto, userId: string, role: UserRole): Promise<ProductResponseDto>;
    remove(id: string, userId: string, role: UserRole): Promise<void>;
}
