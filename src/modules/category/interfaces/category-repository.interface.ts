import { Category, Prisma } from '@prisma/client';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findChildren(parentId: string): Promise<Category[]>;
  create(data: Prisma.CategoryCreateInput): Promise<Category>;
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category>;
  softDelete(id: string): Promise<Category>;
  findMany(args: Prisma.CategoryFindManyArgs): Promise<Category[]>;
  count(args: Prisma.CategoryCountArgs): Promise<number>;
  findWithChildren(
    id: string,
  ): Promise<(Category & { children: Category[] }) | null>;
}
