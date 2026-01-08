import { ProductRepository } from './repositories/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductSearchDto } from './dto/product-search.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryRepository } from '../category/repositories/category.repository';
export declare class ProductService {
    private readonly productRepository;
    private readonly categoryRepository;
    private readonly prisma;
    constructor(productRepository: ProductRepository, categoryRepository: CategoryRepository, prisma: PrismaService);
    createProduct(dto: CreateProductDto, sellerId: string): Promise<ProductResponseDto>;
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
    searchProducts(query: ProductSearchDto): Promise<{
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
    findById(id: string, incrementViews?: boolean): Promise<ProductResponseDto>;
    updateProduct(id: string, dto: UpdateProductDto, userId: string, userRole: UserRole): Promise<ProductResponseDto>;
    deleteProduct(id: string, userId: string, userRole: UserRole): Promise<void>;
    private generateSlug;
    private validateAndDeduplicateImages;
    private validateImagesExist;
}
