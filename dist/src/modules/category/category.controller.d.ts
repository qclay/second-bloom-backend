import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { UserRole } from '@prisma/client';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(createCategoryDto: CreateCategoryDto, role: UserRole): Promise<CategoryResponseDto>;
    findAll(query: CategoryQueryDto): Promise<{
        data: CategoryResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, includeChildren?: string): Promise<CategoryResponseDto>;
    findChildren(id: string): Promise<CategoryResponseDto[]>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, role: UserRole): Promise<CategoryResponseDto>;
    remove(id: string, role: UserRole): Promise<void>;
}
