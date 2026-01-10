import { CategoryRepository } from './repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
export declare class CategoryService {
    private readonly categoryRepository;
    private readonly prisma;
    private readonly redisService;
    private readonly logger;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    private readonly CACHE_LIST_PREFIX;
    constructor(categoryRepository: CategoryRepository, prisma: PrismaService, redisService: RedisService);
    createCategory(dto: CreateCategoryDto, userRole: UserRole): Promise<CategoryResponseDto>;
    findAll(query: CategoryQueryDto): Promise<{
        data: CategoryResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string, includeChildren?: boolean): Promise<CategoryResponseDto>;
    findChildren(parentId: string): Promise<CategoryResponseDto[]>;
    updateCategory(id: string, dto: UpdateCategoryDto, userRole: UserRole): Promise<CategoryResponseDto>;
    deleteCategory(id: string, userRole: UserRole): Promise<void>;
    private invalidateCache;
    private generateSlug;
    private getMaxOrder;
    private isDescendant;
    private validateImageExists;
}
