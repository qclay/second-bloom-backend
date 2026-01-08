import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ICategoryRepository } from '../interfaces/category-repository.interface';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        image: true,
      },
    });
  }

  async findChildren(parentId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        parentId,
        deletedAt: null,
      },
      include: {
        image: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findWithChildren(
    id: string,
  ): Promise<(Category & { children: Category[] }) | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        image: true,
        children: {
          where: { deletedAt: null },
          include: {
            image: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({
      data,
      include: {
        image: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        image: true,
      },
    });
  }

  async softDelete(id: string): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async findMany(args: Prisma.CategoryFindManyArgs): Promise<Category[]> {
    return this.prisma.category.findMany(args);
  }

  async count(args: Prisma.CategoryCountArgs): Promise<number> {
    return this.prisma.category.count(args);
  }
}
