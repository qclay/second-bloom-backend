import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CategoryRepository } from './repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Prisma, Category, ProductStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'category:';
  private readonly CACHE_LIST_PREFIX = 'categories:list:';

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const slug = this.generateSlug(dto.name);
    const existingCategory = await this.categoryRepository.findBySlug(slug);

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent || parent.deletedAt) {
        throw new NotFoundException('Parent category not found');
      }
    }

    if (dto.imageId) {
      const imageExists = await this.validateImageExists(dto.imageId);
      if (!imageExists) {
        throw new NotFoundException('Image not found');
      }
    }

    const maxOrder = await this.getMaxOrder(dto.parentId);
    const order = dto.order ?? maxOrder + 1;

    const category = await this.categoryRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      image: dto.imageId
        ? {
            connect: { id: dto.imageId },
          }
        : undefined,
      parent: dto.parentId
        ? {
            connect: { id: dto.parentId },
          }
        : undefined,
      isActive: dto.isActive ?? true,
      order,
    });

    await this.invalidateCache();

    return CategoryResponseDto.fromEntity(category);
  }

  async findAll(query: CategoryQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      parentId,
      includeChildren = false,
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const cacheKey = `${this.CACHE_LIST_PREFIX}${JSON.stringify({
      page,
      limit: maxLimit,
      search,
      isActive,
      parentId,
      includeChildren,
    })}`;

    if (!search && page === 1 && maxLimit <= 50) {
      const cached = await this.redisService.get<{
        data: CategoryResponseDto[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit for categories list: ${cacheKey}`);
        return cached;
      }
    }

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (parentId === null || parentId === 'null') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    const [categories, total] = await Promise.all([
      this.categoryRepository.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          image: true,
          ...(includeChildren && {
            children: {
              where: { deletedAt: null },
              include: {
                image: true,
              },
              orderBy: { order: 'asc' },
            },
          }),
        },
      }),
      this.categoryRepository.count({ where }),
    ]);

    const categoryIds = categories.map((c) => c.id);
    const productCounts =
      categoryIds.length === 0
        ? []
        : await this.prisma.product.groupBy({
            by: ['categoryId'],
            where: {
              categoryId: { in: categoryIds },
              deletedAt: null,
              isActive: true,
              status: ProductStatus.ACTIVE,
            },
            _count: { _all: true },
          });

    const countMap = new Map<string, number>();
    for (const row of productCounts) {
      countMap.set(row.categoryId, row._count._all);
    }

    const result = {
      data: categories.map((category) =>
        CategoryResponseDto.fromEntity({
          ...category,
          activeProductCount: countMap.get(category.id) ?? 0,
        }),
      ),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };

    if (!search && page === 1 && maxLimit <= 50) {
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);
      this.logger.debug(`Cached categories list: ${cacheKey}`);
    }

    return result;
  }

  async findById(
    id: string,
    includeChildren = false,
  ): Promise<CategoryResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}${id}:${includeChildren}`;

    const cached = await this.redisService.get<CategoryResponseDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for category: ${id}`);
      return cached;
    }

    let category: Category | (Category & { children?: Category[] }) | null;

    if (includeChildren) {
      category = await this.categoryRepository.findWithChildren(id);
    } else {
      category = await this.categoryRepository.findById(id);
    }

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.deletedAt) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const activeProductCount = await this.prisma.product.count({
      where: {
        categoryId: id,
        deletedAt: null,
        isActive: true,
        status: ProductStatus.ACTIVE,
      },
    });

    const result = CategoryResponseDto.fromEntity({
      ...(category as Category & { children?: Category[] }),
      activeProductCount,
    });

    await this.redisService.set(cacheKey, result, this.CACHE_TTL);
    this.logger.debug(`Cached category: ${id}`);

    return result;
  }

  async findChildren(parentId: string): Promise<CategoryResponseDto[]> {
    const parent = await this.categoryRepository.findById(parentId);
    if (!parent || parent.deletedAt) {
      throw new NotFoundException('Parent category not found');
    }

    const children = await this.categoryRepository.findChildren(parentId);
    return children.map((child) => CategoryResponseDto.fromEntity(child));
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
    userRole: UserRole,
  ): Promise<CategoryResponseDto> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update categories');
    }

    const category = await this.categoryRepository.findById(id);

    if (!category || category.deletedAt) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const updateData: Prisma.CategoryUpdateInput = {};

    if (dto.name && dto.name !== category.name) {
      const slug = this.generateSlug(dto.name);
      const existingCategory = await this.categoryRepository.findBySlug(slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
      updateData.slug = slug;
      updateData.name = dto.name;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      if (dto.parentId) {
        const parent = await this.categoryRepository.findById(dto.parentId);
        if (!parent || parent.deletedAt) {
          throw new NotFoundException('Parent category not found');
        }

        const isDescendant = await this.isDescendant(id, dto.parentId);
        if (isDescendant) {
          throw new BadRequestException(
            'Cannot set a descendant category as parent',
          );
        }
        updateData.parent = { connect: { id: dto.parentId } };
      } else {
        updateData.parent = { disconnect: true };
      }
    }

    if (dto.imageId !== undefined) {
      if (dto.imageId && dto.imageId !== category.imageId) {
        const imageExists = await this.validateImageExists(dto.imageId);
        if (!imageExists) {
          throw new NotFoundException('Image not found');
        }
        updateData.image = { connect: { id: dto.imageId } };
      } else if (!dto.imageId) {
        updateData.image = { disconnect: true };
      }
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.isActive !== undefined) {
      updateData.isActive = dto.isActive;
    }

    if (dto.order !== undefined) {
      updateData.order = dto.order;
    }

    const updatedCategory = await this.categoryRepository.update(
      id,
      updateData,
    );

    await this.invalidateCache(id);

    return CategoryResponseDto.fromEntity(updatedCategory);
  }

  async deleteCategory(id: string, userRole: UserRole): Promise<void> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete categories');
    }

    const productCount = await this.prisma.product.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${productCount} product(s). Please remove or reassign products first.`,
      );
    }

    const category = await this.categoryRepository.findById(id);

    if (!category || category.deletedAt) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const children = await this.categoryRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with child categories. Please delete or move children first.',
      );
    }

    await this.categoryRepository.softDelete(id);

    await this.invalidateCache(id);
  }

  private async invalidateCache(categoryId?: string): Promise<void> {
    try {
      if (categoryId) {
        await this.redisService.del(`${this.CACHE_PREFIX}${categoryId}:false`);
        await this.redisService.del(`${this.CACHE_PREFIX}${categoryId}:true`);
      }

      await this.redisService.delPattern(`${this.CACHE_LIST_PREFIX}*`);
      this.logger.debug('Category cache invalidated');
    } catch (error) {
      this.logger.warn('Failed to invalidate cache', error);
    }
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      throw new BadRequestException(
        'Category name must contain at least one alphanumeric character',
      );
    }

    return baseSlug;
  }

  private async getMaxOrder(
    parentId: string | null | undefined,
  ): Promise<number> {
    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
    };

    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null;
    }

    const categories = await this.categoryRepository.findMany({
      where,
      orderBy: { order: 'desc' },
      take: 1,
    });

    return categories.length > 0 ? categories[0].order : 0;
  }

  private async isDescendant(
    categoryId: string,
    potentialParentId: string,
  ): Promise<boolean> {
    const MAX_DEPTH = 20;
    let currentId: string | null = categoryId;
    const visited = new Set<string>();

    for (let i = 0; i < MAX_DEPTH; i++) {
      if (visited.has(currentId)) {
        throw new BadRequestException(
          'Circular reference detected in category hierarchy',
        );
      }
      visited.add(currentId);

      const category = await this.categoryRepository.findById(currentId);
      if (!category || !category.parentId) {
        return false;
      }
      if (category.parentId === potentialParentId) {
        return true;
      }
      currentId = category.parentId;
    }

    throw new BadRequestException(
      `Category hierarchy depth exceeds maximum of ${MAX_DEPTH} levels`,
    );
  }

  private async validateImageExists(imageId: string): Promise<boolean> {
    const file = await this.prisma.file.findUnique({
      where: { id: imageId },
    });
    return file !== null && file.deletedAt === null;
  }
}
