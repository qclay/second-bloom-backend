import { Product, Prisma } from '@prisma/client';
export interface IProductRepository {
    findById(id: string): Promise<Product | null>;
    findBySlug(slug: string): Promise<Product | null>;
    create(data: Prisma.ProductCreateInput): Promise<Product>;
    update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;
    softDelete(id: string, deletedBy: string): Promise<Product>;
    findMany(args: Prisma.ProductFindManyArgs): Promise<Product[]>;
    count(args: Prisma.ProductCountArgs): Promise<number>;
    incrementViews(id: string): Promise<Product>;
}
