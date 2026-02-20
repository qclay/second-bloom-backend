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
import { Prisma, ProductStatus, UserRole, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryRepository } from '../category/repositories/category.repository';
import { CacheService } from '../../common/services/cache.service';
import { AuctionService } from '../auction/auction.service';
import { CreateAuctionDto } from '../auction/dto/create-auction.dto';
import { atLeastOneTranslation } from '../../common/dto/translation.dto';
import { getTranslationForSlug } from '../../common/i18n/translation.util';
import { TranslationService } from '../translation/translation.service';

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
    private readonly translationService: TranslationService,
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
      select: { id: true },
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
      select: { id: true },
    });
    if (!size) {
      throw new NotFoundException('Size not found or inactive');
    }

    if (dto.title && atLeastOneTranslation(dto.title)) {
      dto.title = await this.translationService.autoCompleteTranslations(
        dto.title,
      );
    }
    if (dto.description) {
      dto.description = await this.translationService.autoCompleteTranslations(
        dto.description,
      );
    }

    const effectivePrice =
      dto.createAuction === true
        ? (dto.auction?.startPrice ?? dto.price ?? 0)
        : (dto.price ?? 0);

    const titleForSlug =
      dto.title && atLeastOneTranslation(dto.title)
        ? getTranslationForSlug(dto.title as Record<string, string>)
        : '';
    const slug = await this.ensureUniqueSlug(
      titleForSlug
        ? this.generateSlug(titleForSlug)
        : `product-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    );

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
            ...(dto.title && {
              title: dto.title as unknown as Prisma.InputJsonValue,
            }),
            slug,
            description: dto.description
              ? (dto.description as unknown as Prisma.InputJsonValue)
              : undefined,
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
            ...(dto.regionId && {
              regionRelation: { connect: { id: dto.regionId } },
            }),
            ...(dto.cityId && {
              cityRelation: { connect: { id: dto.cityId } },
            }),
            ...(dto.districtId && {
              districtRelation: { connect: { id: dto.districtId } },
            }),
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
      salePhase,
      regionId,
      cityId,
      districtId,
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
      ...(status ? {} : salePhase ? {} : { status: ProductStatus.ACTIVE }),
    };

    if (search) {
      where.OR = [
        { slug: { contains: search, mode: 'insensitive' } },
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

    if (salePhase) {
      if (salePhase === 'in_auction') {
        where.auctions = {
          some: {
            status: 'ACTIVE',
            endTime: { gte: new Date() },
            deletedAt: null,
          },
        };
      } else if (salePhase === 'sold') {
        where.OR = [
          {
            orders: {
              some: {
                status: OrderStatus.DELIVERED,
                deletedAt: null,
              },
            },
          },
          {
            auctions: {
              some: {
                status: 'ENDED',
                deletedAt: null,
              },
            },
          },
        ];
      } else if (salePhase === 'in_delivery') {
        // Ожидают доставки: order confirmed/shipped but not yet delivered
        where.orders = {
          some: {
            status: {
              in: [
                OrderStatus.CONFIRMED,
                OrderStatus.PROCESSING,
                OrderStatus.SHIPPED,
              ],
            },
            deletedAt: null,
          },
        };
      }
      // salePhase === 'all' → no extra filter (all seller's products)
    }

    if (regionId) {
      where.regionId = regionId;
    }
    if (cityId) {
      where.cityId = cityId;
    }
    if (districtId) {
      where.districtId = districtId;
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
    } else if (sortBy === 'rating') {
      orderBy.seller = { rating: sortOrder };
    } else {
      orderBy.createdAt = 'desc';
    }

    const shouldCache =
      !search &&
      page === 1 &&
      maxLimit <= 50 &&
      !query.conditionId &&
      !query.sizeId &&
      !salePhase;
    const cacheKey = shouldCache
      ? this.cacheService.generateListKey(this.CACHE_PREFIX, {
          page,
          limit: maxLimit,
          categoryId,
          sellerId,
          isFeatured,
          type,
          status,
          regionId,
          cityId,
          districtId,
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

    const now = new Date();
    const listInclude: Prisma.ProductInclude = {
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
      regionRelation: { select: { name: true } },
      cityRelation: { select: { name: true } },
      districtRelation: { select: { name: true } },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
      images: {
        where: { deletedAt: null, isActive: true },
        include: {
          file: {
            select: {
              url: true,
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      },
      auctions: {
        where: {
          status: 'ACTIVE',
          isActive: true,
          deletedAt: null,
          endTime: { gte: now },
        },
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          endTime: true,
          status: true,
          currentPrice: true,
          totalBids: true,
        },
      },
    };
    if (salePhase === 'sold' || salePhase === 'in_delivery') {
      listInclude.orders = {
        take: 1,
        orderBy: { createdAt: 'desc' },
        where: { deletedAt: null },
        select: {
          id: true,
          status: true,
          deliveredAt: true,
          shippedAt: true,
        },
      };
    }

    const [products, total] = await Promise.all([
      this.productRepository.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy,
        include: listInclude,
      }),
      this.productRepository.count({ where }),
    ]);

    type ProductWithActiveAuction = (typeof products)[number] & {
      auctions?: Array<{
        id: string;
        endTime: Date;
        status: string;
        currentPrice: unknown;
        totalBids: number;
      }>;
      orders?: Array<{
        id: string;
        status: string;
        deliveredAt: Date | null;
        shippedAt: Date | null;
      }>;
    };
    const result = {
      data: products.map((product) => {
        const p = product as ProductWithActiveAuction;
        const lastOrder = p.orders?.[0];
        return ProductResponseDto.fromEntity({
          ...p,
          activeAuction: p.auctions?.[0],
          saleOrderSummary: lastOrder
            ? {
                id: lastOrder.id,
                status: lastOrder.status,
                deliveredAt: lastOrder.deliveredAt,
                shippedAt: lastOrder.shippedAt,
              }
            : undefined,
        } as Parameters<typeof ProductResponseDto.fromEntity>[0]);
      }),
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
      regionId,
      regionIds,
      cityId,
      cityIds,
      districtId,
      districtIds,
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
        { slug: { contains: search, mode: 'insensitive' } },
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

    if (regionId) {
      where.regionId = regionId;
    } else if (regionIds && regionIds.length > 0) {
      where.regionId = { in: regionIds };
    }
    if (cityId) {
      where.cityId = cityId;
    } else if (cityIds && cityIds.length > 0) {
      where.cityId = { in: cityIds };
    }
    if (districtId) {
      where.districtId = districtId;
    } else if (districtIds && districtIds.length > 0) {
      where.districtId = { in: districtIds };
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
          regionRelation: { select: { name: true } },
          cityRelation: { select: { name: true } },
          districtRelation: { select: { name: true } },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          images: {
            where: { deletedAt: null, isActive: true },
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
        regionRelation: { select: { name: true } },
        cityRelation: { select: { name: true } },
        districtRelation: { select: { name: true } },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        images: {
          where: { deletedAt: null, isActive: true },
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

    if (dto.title && atLeastOneTranslation(dto.title)) {
      dto.title = await this.translationService.autoCompleteTranslations(
        dto.title,
      );
      const titleForSlug = getTranslationForSlug(
        dto.title as Record<string, string>,
      );
      const slug = await this.ensureUniqueSlug(
        this.generateSlug(titleForSlug),
        id,
      );
      updateData.slug = slug;
      updateData.title = dto.title as unknown as Prisma.InputJsonValue;
    }

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category || category.deletedAt || !category.isActive) {
        throw new NotFoundException('Category not found or inactive');
      }
    }

    const validatedImageIds = Array.isArray(dto.imageIds)
      ? this.validateAndDeduplicateImages(dto.imageIds)
      : undefined;

    if (validatedImageIds && validatedImageIds.length > 0) {
      await this.validateImagesExist(validatedImageIds);
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
          select: { id: true },
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
          select: { id: true },
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
    if (dto.regionId !== undefined) {
      updateData.regionRelation = dto.regionId
        ? { connect: { id: dto.regionId } }
        : { disconnect: true };
    }
    if (dto.cityId !== undefined) {
      updateData.cityRelation = dto.cityId
        ? { connect: { id: dto.cityId } }
        : { disconnect: true };
    }
    if (dto.districtId !== undefined) {
      updateData.districtRelation = dto.districtId
        ? { connect: { id: dto.districtId } }
        : { disconnect: true };
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

    if (dto.createAuction === true) {
      const activeAuction = await this.prisma.auction.findFirst({
        where: { productId: id, status: 'ACTIVE' },
        select: { id: true },
      });
      if (activeAuction) {
        throw new BadRequestException(
          'This product already has an active auction. You cannot create another until it ends.',
        );
      }
      const productForAuction = await this.productRepository.findById(id);
      const rawPrice =
        dto.auction?.startPrice ?? dto.price ?? productForAuction?.price ?? 0;
      const effectivePrice =
        typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
      const auctionDto: CreateAuctionDto = {
        productId: id,
        startPrice: effectivePrice,
        endTime: dto.auction?.endTime,
        durationHours: dto.auction?.durationHours ?? 2,
        autoExtend: dto.auction?.autoExtend ?? true,
        extendMinutes: dto.auction?.extendMinutes ?? 5,
      };
      await this.auctionService.createAuction(auctionDto, userId, userRole);
      this.logger.log(
        `Auction created for product ${id} via update (caller: ${userId})`,
      );
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
