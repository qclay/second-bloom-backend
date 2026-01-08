import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IProductRepository } from '../interfaces/product-repository.interface';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { slug },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        status: 'INACTIVE' as const,
      },
    });
  }

  async findMany(args: Prisma.ProductFindManyArgs): Promise<Product[]> {
    return this.prisma.product.findMany(args);
  }

  async count(args: Prisma.ProductCountArgs): Promise<number> {
    return this.prisma.product.count(args);
  }

  async incrementViews(id: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }
}
