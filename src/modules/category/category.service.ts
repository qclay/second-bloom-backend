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
import { atLeastOneTranslation } from '../../common/dto/translation.dto';
import { getTranslationForSlug } from '../../common/i18n/translation.util';
import { TranslationService } from '../translation/translation.service';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    if (!atLeastOneTranslation(dto.name)) {
      throw new BadRequestException(
        'Category name must have at least one translation (en, ru, or uz)',
      );
    }

    dto.name = await this.translationService.autoCompleteTranslations(dto.name);
    if (dto.description) {
      dto.description = await this.translationService.autoCompleteTranslations(
        dto.description,
      );
    }

    const nameForSlug = getTranslationForSlug(
      dto.name as Record<string, string>,
    );
    const slug = this.generateSlug(nameForSlug);
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

    const maxOrder = await this.getMaxOrder(dto.parentId ?? undefined);
    const order = dto.order ?? maxOrder + 1;

    const category = await this.categoryRepository.create({
      name: dto.name as unknown as Prisma.InputJsonValue,
      slug,
      description: dto.description
        ? (dto.description as unknown as Prisma.InputJsonValue)
        : undefined,
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

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [{ slug: { contains: search, mode: 'insensitive' } }];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (parentId === null || parentId === 'null') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    const [categories, total, totalActiveProductCount, uncategorizedActiveProductCount] = await Promise.all([
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
      this.prisma.product.count({
        where: {
          deletedAt: null,
          isActive: true,
          status: ProductStatus.PUBLISHED,
        },
      }),
      this.prisma.product.count({
        where: {
          deletedAt: null,
          isActive: true,
          status: ProductStatus.PUBLISHED,
          categoryId: null,
        },
      }),
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
              status: ProductStatus.PUBLISHED,
            },
            _count: { _all: true },
          });

    const countMap = new Map<string, number>();
    for (const row of productCounts) {
      if (row.categoryId) {
        countMap.set(row.categoryId, row._count._all);
      }
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
        totalActiveProductCount,
        uncategorizedActiveProductCount,
      },
    };

    return result;
  }

  async findById(
    id: string,
    includeChildren = false,
  ): Promise<CategoryResponseDto> {
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
        status: ProductStatus.PUBLISHED,
      },
    });

    return CategoryResponseDto.fromEntity({
      ...(category as Category & { children?: Category[] }),
      activeProductCount,
    });
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

    if (dto.name && atLeastOneTranslation(dto.name)) {
      dto.name = await this.translationService.autoCompleteTranslations(
        dto.name,
      );
      const nameForSlug = getTranslationForSlug(
        dto.name as Record<string, string>,
      );
      const slug = this.generateSlug(nameForSlug);
      const existingCategory = await this.categoryRepository.findBySlug(slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
      updateData.slug = slug;
      updateData.name = dto.name as unknown as Prisma.InputJsonValue;
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
      if (dto.description) {
        dto.description =
          await this.translationService.autoCompleteTranslations(
            dto.description,
          );
      }
      updateData.description = dto.description
        ? (dto.description as unknown as Prisma.InputJsonValue)
        : undefined;
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
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      throw new BadRequestException(
        'Category name must contain at least one letter or number',
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
      select: { id: true, deletedAt: true },
    });
    return file !== null && file.deletedAt === null;
  }
}
