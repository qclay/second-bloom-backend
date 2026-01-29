import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductSearchDto } from './dto/product-search.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { Prisma, ProductStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryRepository } from '../category/repositories/category.repository';
import { CacheService } from '../../common/services/cache.service';
import { AuctionService } from '../auction/auction.service';
import { CreateAuctionDto } from '../auction/dto/create-auction.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly CACHE_PREFIX = 'product';
  private readonly CACHE_TTL = 1800;

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    @Inject(forwardRef(() => AuctionService))
    private readonly auctionService: AuctionService,
  ) {}

  async createProduct(
    dto: CreateProductDto,
    sellerId: string,
  ): Promise<ProductResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { publicationCredits: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ADMIN && user.publicationCredits < 1) {
      throw new BadRequestException(
        'Insufficient publication credits. Please purchase credits to create a product.',
      );
    }

    if (!dto.createAuction && (dto.price === undefined || dto.price === null)) {
      throw new BadRequestException(
        'Price is required for fixed-price products',
      );
    }
    if (dto.createAuction) {
      const hasPrice = dto.price !== undefined && dto.price !== null;
      const hasStartPrice =
        dto.auction?.startPrice !== undefined &&
        dto.auction?.startPrice !== null;
      if (!hasPrice && !hasStartPrice) {
        throw new BadRequestException(
          'Either price or auction.startPrice is required when creating an auction',
        );
      }
    }

    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category || category.deletedAt || !category.isActive) {
      throw new NotFoundException('Category not found or inactive');
    }

    const condition = await this.prisma.condition.findFirst({
      where: {
        id: dto.conditionId,
        deletedAt: null,
        isActive: true,
      },
    });
    if (!condition) {
      throw new NotFoundException('Condition not found or inactive');
    }
    const size = await this.prisma.size.findFirst({
      where: {
        id: dto.sizeId,
        deletedAt: null,
        isActive: true,
      },
    });
    if (!size) {
      throw new NotFoundException('Size not found or inactive');
    }

    const effectivePrice =
      dto.createAuction === true
        ? (dto.auction?.startPrice ?? dto.price ?? 0)
        : (dto.price ?? 0);

    const slug = await this.ensureUniqueSlug(this.generateSlug(dto.title));

    const validatedImageIds = dto.imageIds
      ? this.validateAndDeduplicateImages(dto.imageIds)
      : undefined;

    if (validatedImageIds && validatedImageIds.length > 0) {
      await this.validateImagesExist(validatedImageIds);
    }

    const product = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        if (user.role !== UserRole.ADMIN) {
          await tx.user.update({
            where: { id: sellerId },
            data: {
              publicationCredits: {
                decrement: 1,
              },
            },
          });
        }

        const createdProduct = await tx.product.create({
          data: {
            title: dto.title,
            slug,
            description: dto.description,
            price: effectivePrice,
            currency: dto.currency ?? 'UZS',
            category: {
              connect: { id: dto.categoryId },
            },
            tags: dto.tags ?? [],
            type: dto.type ?? 'FRESH',
            condition: { connect: { id: dto.conditionId } },
            size: { connect: { id: dto.sizeId } },
            quantity: dto.quantity ?? 1,
            status: dto.status ?? ProductStatus.ACTIVE,
            isFeatured: dto.isFeatured ?? false,
            region: dto.region,
            city: dto.city,
            district: dto.district,
            seller: {
              connect: { id: sellerId },
            },
          },
        });

        if (validatedImageIds && validatedImageIds.length > 0) {
          await tx.productImage.createMany({
            data: validatedImageIds.map((fileId, index) => ({
              productId: createdProduct.id,
              fileId,
              displayOrder: index,
            })),
          });
        }

        return createdProduct;
      },
    );

    if (dto.createAuction) {
      const auctionDto: CreateAuctionDto = {
        productId: product.id,
        startPrice: dto.auction?.startPrice ?? effectivePrice,
        endTime: dto.auction?.endTime,
        durationHours: dto.auction?.durationHours ?? 2,
        autoExtend: dto.auction?.autoExtend ?? true,
        extendMinutes: dto.auction?.extendMinutes ?? 5,
      };
      await this.auctionService.createAuction(auctionDto, sellerId);
      this.logger.log(
        `Auction created for product ${product.id} (seller: ${sellerId})`,
      );
    }

    const result = await this.findById(product.id);

    await this.cacheService.invalidateEntity(this.CACHE_PREFIX);

    this.logger.log(
      `Product created: ${product.id} by user: ${sellerId}. Credits remaining: ${user.role !== UserRole.ADMIN ? user.publicationCredits - 1 : 'unlimited (admin)'}`,
    );

    return result;
  }

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      sellerId,
      isFeatured,
      type,
      status,
      region,
      city,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(status ? {} : { status: ProductStatus.ACTIVE }),
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (region) {
      where.region = region;
    }

    if (city) {
      where.city = city;
    }

    if (query.conditionId) {
      where.conditionId = query.conditionId;
    }
    if (query.sizeId) {
      where.sizeId = query.sizeId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        throw new BadRequestException(
          'minPrice must be less than or equal to maxPrice',
        );
      }
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'views') {
      orderBy.views = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const shouldCache =
      !search &&
      page === 1 &&
      maxLimit <= 50 &&
      !query.conditionId &&
      !query.sizeId;
    const cacheKey = shouldCache
      ? this.cacheService.generateListKey(this.CACHE_PREFIX, {
          page,
          limit: maxLimit,
          categoryId,
          sellerId,
          isFeatured,
          type,
          status,
          region,
          city,
          sortBy,
          sortOrder,
        })
      : null;

    if (cacheKey) {
      const cached = await this.cacheService.get<{
        data: ProductResponseDto[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }>(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit for products list: ${cacheKey}`);
        return cached;
      }
    }

    const [products, total] = await Promise.all([
      this.productRepository.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          condition: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          size: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          images: {
            include: {
              file: {
                select: {
                  url: true,
                },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
        },
      }),
      this.productRepository.count({ where }),
    ]);

    const result = {
      data: products.map((product) => ProductResponseDto.fromEntity(product)),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
        hasNextPage: page * maxLimit < total,
        hasPreviousPage: page > 1,
      },
    };

    if (shouldCache && cacheKey) {
      await this.cacheService.set(cacheKey, result, this.CACHE_TTL);
      this.logger.debug(`Cached products list: ${cacheKey}`);
    }

    return result;
  }

  async searchProducts(query: ProductSearchDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      categoryIds,
      sellerId,
      sellerIds,
      isFeatured,
      type,
      types,
      status,
      statuses,
      region,
      regions,
      city,
      cities,
      district,
      conditionId,
      conditionIds,
      sizeId,
      sizeIds,
      minPrice,
      maxPrice,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categoryIds && categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }

    if (sellerId) {
      where.sellerId = sellerId;
    } else if (sellerIds && sellerIds.length > 0) {
      where.sellerId = { in: sellerIds };
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (type) {
      where.type = type;
    } else if (types && types.length > 0) {
      where.type = { in: types };
    }

    if (status) {
      where.status = status;
    } else if (statuses && statuses.length > 0) {
      where.status = { in: statuses };
    }

    if (region) {
      where.region = region;
    } else if (regions && regions.length > 0) {
      where.region = { in: regions };
    }

    if (city) {
      where.city = city;
    } else if (cities && cities.length > 0) {
      where.city = { in: cities };
    }

    if (district) {
      where.district = district;
    }

    if (conditionId) {
      where.conditionId = conditionId;
    } else if (conditionIds && conditionIds.length > 0) {
      where.conditionId = { in: conditionIds };
    }

    if (sizeId) {
      where.sizeId = sizeId;
    } else if (sizeIds && sizeIds.length > 0) {
      where.sizeId = { in: sizeIds };
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        throw new BadRequestException(
          'minPrice must be less than or equal to maxPrice',
        );
      }
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'views') {
      orderBy.views = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      this.productRepository.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          condition: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          size: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          images: {
            include: {
              file: {
                select: {
                  url: true,
                },
              },
            },
            orderBy: { displayOrder: 'asc' },
          },
        },
      }),
      this.productRepository.count({ where }),
    ]);

    return {
      data: products.map((product) => ProductResponseDto.fromEntity(product)),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
        hasNextPage: page * maxLimit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(
    id: string,
    incrementViews = false,
  ): Promise<ProductResponseDto> {
    const productWithRelations = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        condition: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        size: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        images: {
          include: {
            file: {
              select: {
                url: true,
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!productWithRelations) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (productWithRelations.deletedAt) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const now = new Date();
    const activeAuction = await this.prisma.auction.findFirst({
      where: {
        productId: id,
        status: 'ACTIVE',
        isActive: true,
        deletedAt: null,
        endTime: { gte: now },
      },
      select: {
        id: true,
        endTime: true,
        status: true,
        currentPrice: true,
        totalBids: true,
      },
    });

    if (incrementViews) {
      await this.productRepository.incrementViews(id);
      await this.cacheService.invalidateEntity(this.CACHE_PREFIX, id);
    }

    const result = ProductResponseDto.fromEntity({
      ...productWithRelations,
      activeAuction: activeAuction ?? undefined,
    } as typeof productWithRelations & {
      activeAuction?: {
        id: string;
        endTime: Date;
        status: string;
        currentPrice: unknown;
        totalBids: number;
      };
    });

    return result;
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    userId: string,
    userRole: UserRole,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.sellerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own products');
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (dto.title && dto.title !== product.title) {
      const slug = await this.ensureUniqueSlug(
        this.generateSlug(dto.title),
        id,
      );
      updateData.slug = slug;
      updateData.title = dto.title;
    }

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category || category.deletedAt || !category.isActive) {
        throw new NotFoundException('Category not found or inactive');
      }
    }

    const validatedImageIds =
      dto.imageIds !== undefined
        ? this.validateAndDeduplicateImages(dto.imageIds)
        : undefined;

    if (validatedImageIds && validatedImageIds.length > 0) {
      const existingProductImages = await this.prisma.productImage.findMany({
        where: { productId: id },
        select: { fileId: true },
      });
      const existingFileIds = new Set(
        existingProductImages.map((img) => img.fileId),
      );
      const newImageIds = validatedImageIds.filter(
        (id) => !existingFileIds.has(id),
      );

      if (newImageIds.length > 0) {
        await this.validateImagesExist(newImageIds);
      }
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.price !== undefined) {
      updateData.price = dto.price;
    }
    if (dto.currency !== undefined) {
      updateData.currency = dto.currency;
    }
    if (dto.categoryId !== undefined) {
      updateData.category = { connect: { id: dto.categoryId } };
    }
    if (dto.tags !== undefined) {
      updateData.tags = dto.tags;
    }
    if (dto.type !== undefined) {
      updateData.type = dto.type;
    }
    if (dto.conditionId !== undefined) {
      if (dto.conditionId) {
        const condition = await this.prisma.condition.findFirst({
          where: {
            id: dto.conditionId,
            deletedAt: null,
            isActive: true,
          },
        });
        if (!condition) {
          throw new NotFoundException('Condition not found or inactive');
        }
      }
      updateData.condition = dto.conditionId
        ? { connect: { id: dto.conditionId } }
        : { disconnect: true };
    }
    if (dto.sizeId !== undefined) {
      if (dto.sizeId) {
        const size = await this.prisma.size.findFirst({
          where: {
            id: dto.sizeId,
            deletedAt: null,
            isActive: true,
          },
        });
        if (!size) {
          throw new NotFoundException('Size not found or inactive');
        }
      }
      updateData.size = dto.sizeId
        ? { connect: { id: dto.sizeId } }
        : { disconnect: true };
    }
    if (dto.quantity !== undefined) {
      updateData.quantity = dto.quantity;
    }
    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }
    if (dto.isFeatured !== undefined) {
      updateData.isFeatured = dto.isFeatured;
    }
    if (dto.region !== undefined) {
      updateData.region = dto.region;
    }
    if (dto.city !== undefined) {
      updateData.city = dto.city;
    }
    if (dto.district !== undefined) {
      updateData.district = dto.district;
    }

    if (validatedImageIds !== undefined || Object.keys(updateData).length > 0) {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (Object.keys(updateData).length > 0) {
          await tx.product.update({
            where: { id },
            data: updateData,
          });
        }

        if (validatedImageIds !== undefined) {
          await tx.productImage.deleteMany({
            where: { productId: id },
          });

          if (validatedImageIds.length > 0) {
            await tx.productImage.createMany({
              data: validatedImageIds.map((fileId, index) => ({
                productId: id,
                fileId,
                displayOrder: index,
              })),
            });
          }
        }
      });
    }

    return this.findById(id);
  }

  async deleteProduct(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.sellerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own products');
    }

    const activeAuctions = await this.prisma.auction.count({
      where: {
        productId: id,
        status: 'ACTIVE',
      },
    });

    if (activeAuctions > 0) {
      throw new BadRequestException(
        'Cannot delete product with active auctions',
      );
    }

    await this.productRepository.softDelete(id, userId);

    await this.cacheService.invalidateEntity(this.CACHE_PREFIX, id);
  }

  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      throw new BadRequestException(
        'Product title must contain at least one alphanumeric character',
      );
    }

    return baseSlug;
  }

  private async ensureUniqueSlug(
    baseSlug: string,
    excludeProductId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let suffix = 1;

    const maxSuffix = 1000;

    while (suffix <= maxSuffix) {
      const existing = await this.productRepository.findBySlug(slug);
      const isOwnProduct =
        excludeProductId && existing?.id === excludeProductId;

      if (!existing || isOwnProduct) {
        return slug;
      }

      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const fallbackSuffix = Date.now().toString(36);
    return `${baseSlug}-${fallbackSuffix}`;
  }

  private validateAndDeduplicateImages(imageIds: string[]): string[] {
    if (imageIds.length === 0) {
      return [];
    }

    if (imageIds.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed per product');
    }

    const uniqueImageIds = [...new Set(imageIds)];
    if (uniqueImageIds.length !== imageIds.length) {
      throw new BadRequestException('Duplicate images are not allowed');
    }

    return uniqueImageIds;
  }

  private async validateImagesExist(imageIds: string[]): Promise<void> {
    if (imageIds.length === 0) {
      return;
    }

    const files = await this.prisma.file.findMany({
      where: {
        id: { in: imageIds },
        deletedAt: null,
      },
    });

    if (files.length !== imageIds.length) {
      const foundIds = new Set(files.map((f) => f.id));
      const missingIds = imageIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`Images not found: ${missingIds.join(', ')}`);
    }
  }
}
