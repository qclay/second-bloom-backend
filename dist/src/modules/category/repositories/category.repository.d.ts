import { PrismaService } from '../../../prisma/prisma.service';
import { ICategoryRepository } from '../interfaces/category-repository.interface';
import { Category, Prisma } from '@prisma/client';
export declare class CategoryRepository implements ICategoryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<Category | null>;
    findBySlug(slug: string): Promise<Category | null>;
    findChildren(parentId: string): Promise<Category[]>;
    findWithChildren(id: string): Promise<(Category & {
        children: Category[];
    }) | null>;
    create(data: Prisma.CategoryCreateInput): Promise<Category>;
    update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
    softDelete(id: string): Promise<Category>;
    findMany(args: Prisma.CategoryFindManyArgs): Promise<Category[]>;
    count(args: Prisma.CategoryCountArgs): Promise<number>;
}
