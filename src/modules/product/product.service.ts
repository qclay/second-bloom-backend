import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductSearchDto } from './dto/product-search.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { Prisma, ProductStatus, UserRole, OrderStatus, AuctionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryRepository } from '../category/repositories/category.repository';
import { AuctionService } from '../auction/auction.service';
import { CreateAuctionDto } from '../auction/dto/create-auction.dto';
import { atLeastOneTranslation } from '../../common/dto/translation.dto';
import {
  getTranslationForSlug,
  resolveTranslation,
} from '../../common/i18n/translation.util';
import { TranslationService } from '../translation/translation.service';
import { ConversationService } from '../conversation/conversation.service';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AuctionService))
    private readonly auctionService: AuctionService,
    private readonly translationService: TranslationService,
    private readonly conversationService: ConversationService,
    private readonly telegramService: TelegramService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
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

    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category || category.deletedAt || !category.isActive) {
        throw new NotFoundException('Category not found or inactive');
      }
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
            category: dto.categoryId
              ? { connect: { id: dto.categoryId } }
              : undefined,
            tags: dto.tags ?? [],
            type: dto.type ?? 'FRESH',
            condition: { connect: { id: dto.conditionId } },
            size: { connect: { id: dto.sizeId } },
            quantity: dto.quantity ?? 1,
            status:
              user.role === UserRole.ADMIN
                ? (dto.status ?? ProductStatus.PUBLISHED)
                : ProductStatus.PENDING,
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

    this.logger.log(
      `Product created: ${product.id} by user: ${sellerId}. Credits remaining: ${user.role !== UserRole.ADMIN ? user.publicationCredits - 1 : 'unlimited (admin)'}`,
    );

    if (product.status === ProductStatus.PENDING) {
      void this.notifyTelegramProductPendingModeration(product.id).catch(
        (err) => {
          this.logger.error(
            `Failed to send Telegram moderation message for product ${product.id}: ${
              (err as Error).message
            }`,
          );
        },
      );
    }

    return result;
  }

  private async notifyTelegramProductPendingModeration(
    productId: string,
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneCountryCode: true,
            phoneNumber: true,
          },
        },
        size: { select: { name: true } },
        condition: { select: { name: true } },
        cityRelation: { select: { name: true } },
        regionRelation: { select: { name: true } },
        images: {
          where: { deletedAt: null, isActive: true },
          take: 10,
          include: { file: { select: { url: true } } },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!product) return;

    const sellerNameParts = [
      product.seller?.firstName,
      product.seller?.lastName,
    ].filter(Boolean);
    const sellerName = sellerNameParts.join(' ') || '';

    const ru = 'ru' as const;
    const title =
      resolveTranslation(product.title as Record<string, string> | null, ru) ??
      '';
    const DESCRIPTION_MAX_LENGTH = 80;
    const descriptionRaw = product.description as Record<string, string> | null;
    const descriptionResolved =
      descriptionRaw && typeof descriptionRaw === 'object'
        ? resolveTranslation(descriptionRaw, ru)
        : null;
    const fullDescription = descriptionResolved?.trim() ?? '';
    const description = fullDescription.slice(0, DESCRIPTION_MAX_LENGTH);
    const cityRaw = product.cityRelation?.name ?? product.regionRelation?.name;
    const cityName =
      typeof cityRaw === 'string'
        ? cityRaw
        : cityRaw && typeof cityRaw === 'object'
          ? resolveTranslation(cityRaw as unknown as Record<string, string>, ru)
          : undefined;
    const size =
      product.size?.name && typeof product.size.name === 'object'
        ? resolveTranslation(
            product.size.name as unknown as Record<string, string>,
            ru,
          )
        : (product.size?.name as unknown as string | undefined);
    const condition =
      product.condition?.name && typeof product.condition.name === 'object'
        ? resolveTranslation(
            product.condition.name as unknown as Record<string, string>,
            ru,
          )
        : (product.condition?.name as unknown as string | undefined);

    const rawPrice = product.price;
    const price =
      typeof rawPrice === 'object' &&
      rawPrice &&
      'toNumber' in (rawPrice as unknown as { toNumber?: () => number })
        ? (rawPrice as unknown as { toNumber: () => number }).toNumber()
        : Number(rawPrice ?? 0);

    const imageUrls = (product.images || [])
      .map((img) => img.file?.url)
      .filter((url): url is string => Boolean(url));

    const countryCode = product.seller?.phoneCountryCode?.trim() ?? '';
    const rawPhone = product.seller?.phoneNumber ?? '';
    const phoneDisplay = !rawPhone
      ? '—'
      : countryCode
        ? `${countryCode.startsWith('+') ? countryCode : `+${countryCode}`}${rawPhone}`
        : rawPhone;

    const priceFormatted = price.toLocaleString('ru-RU');
    const currencyLabel = product.currency === 'UZS' ? 'сум' : product.currency;

    const header = '🆕 <b>Новый товар на модерации</b>';
    const captionLines = [
      `Автор: <b>${sellerName}</b>`,
      `Телефон: <code>${phoneDisplay}</code>`,
      title ? `Название: <b>${title}</b>` : '',
      description
        ? `Описание: ${description}${fullDescription.length > DESCRIPTION_MAX_LENGTH ? '…' : ''}`
        : '',
      cityName ? `Город: ${cityName}` : '',
      size ? `Размер: ${size}` : '',
      condition ? `Состояние: ${condition}` : '',
      `Цена: <b>${priceFormatted} ${currencyLabel}</b>`,
      '',
      'Статус: <b>На модерации</b>',
    ]
      .filter(Boolean)
      .join('\n');

    const caption = `${header}\n\n${captionLines}`;
    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '✅ Опубликовать пост',
            callback_data: `product:approve:${product.id}`,
          },
        ],
        [
          {
            text: '✏️ Отправить на обновление',
            callback_data: `product:reject:${product.id}`,
          },
        ],
      ],
    };

    if (imageUrls.length > 0) {
      await this.telegramService.sendMediaGroup(imageUrls, caption, {
        topic: 'moderation',
      });
      await this.telegramService.sendMessage(caption, {
        topic: 'moderation',
        reply_markup: replyMarkup,
      });
    } else {
      await this.telegramService.sendMessage(caption, {
        topic: 'moderation',
        reply_markup: replyMarkup,
      });
    }
  }

  async findAll(query: ProductQueryDto, user?: { id: string; role: UserRole }) {
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
    const restrictedStatuses: ProductStatus[] = [
      ProductStatus.PENDING,
      ProductStatus.DRAFT,
      ProductStatus.REJECTED,
    ];
    if (status && restrictedStatuses.includes(status)) {
      if (!user) {
        throw new ForbiddenException(
          'Authentication required to filter by this status',
        );
      }
      const isAdminOrMod =
        user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;
      if (!isAdminOrMod && sellerId !== user.id) {
        throw new ForbiddenException(
          'Only admins/moderators can list all products with this status, or use sellerId=your id for your own',
        );
      }
    }
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      ...(status
        ? {}
        : salePhase
          ? {}
          : sellerId
            ? {}
            : { status: ProductStatus.PUBLISHED }),
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
            OR: [
              { status: AuctionStatus.PENDING },
              { status: AuctionStatus.ACTIVE, endTime: { gte: new Date() } },
            ],
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
        where.orders = {
          some: {
            status: {
              in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED],
            },
            deletedAt: null,
          },
        };
      }
    }

    if (salePhase !== 'sold' && salePhase !== 'in_delivery') {
      where.orders = {
        none: {
          status: OrderStatus.DELIVERED,
          deletedAt: null,
        },
      };
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
        where: { deletedAt: null },
        take: 1,
        orderBy: { endTime: 'desc' },
        select: {
          id: true,
          endTime: true,
          status: true,
          durationHours: true,
          currentPrice: true,
          totalBids: true,
          winner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      },
      orders: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        where: { deletedAt: null },
        select: {
          id: true,
          status: true,
          deliveredAt: true,
          shippedAt: true,
        },
      },
    };

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
        durationHours: number;
        currentPrice: unknown;
        totalBids: number;
        winner: {
          id: string;
          firstName: string | null;
          lastName: string | null;
          phoneNumber: string;
        } | null;
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
        const activeAuction = p.auctions?.[0];
        const isAuctionActive =
          activeAuction &&
          ((activeAuction.status === AuctionStatus.ACTIVE &&
            activeAuction.endTime >= now) ||
            activeAuction.status === AuctionStatus.PENDING);
        let saleStatus:
          | 'available'
          | 'onAuction'
          | 'awaitingDelivery'
          | 'sold' = 'available';
        if (isAuctionActive) {
          saleStatus = 'onAuction';
        } else if (activeAuction?.status === 'ENDED') {
          saleStatus = 'sold';
        } else if (lastOrder) {
          if (lastOrder.status === OrderStatus.DELIVERED) {
            saleStatus = 'sold';
          } else if (
            lastOrder.status === OrderStatus.PROCESSING ||
            lastOrder.status === OrderStatus.SHIPPED
          ) {
            saleStatus = 'awaitingDelivery';
          }
        }
        return ProductResponseDto.fromEntity({
          ...p,
          activeAuction,
          saleOrderSummary: lastOrder
            ? {
                id: lastOrder.id,
                status: lastOrder.status,
                deliveredAt: lastOrder.deliveredAt,
                shippedAt: lastOrder.shippedAt,
              }
            : undefined,
          saleStatus,
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

    return result;
  }

  private buildWhereBySellerAndPhase(
    sellerId: string,
    salePhase: 'all' | 'in_auction' | 'sold' | 'in_delivery',
  ): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      isActive: true,
      sellerId,
    };
    if (salePhase === 'in_auction') {
      where.auctions = {
        some: {
          OR: [
            { status: AuctionStatus.PENDING },
            { status: AuctionStatus.ACTIVE, endTime: { gte: new Date() } },
          ],
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
      where.orders = {
        some: {
          status: {
            in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED],
          },
          deletedAt: null,
        },
      };
    }
    return where;
  }

  async getProductCounts(sellerId: string): Promise<{
    all: number;
    inAuction: number;
    sold: number;
    inDelivery: number;
  }> {
    const [all, inAuction, sold, inDelivery] = await Promise.all([
      this.prisma.product.count({
        where: this.buildWhereBySellerAndPhase(sellerId, 'all'),
      }),
      this.prisma.product.count({
        where: this.buildWhereBySellerAndPhase(sellerId, 'in_auction'),
      }),
      this.prisma.product.count({
        where: this.buildWhereBySellerAndPhase(sellerId, 'sold'),
      }),
      this.prisma.product.count({
        where: this.buildWhereBySellerAndPhase(sellerId, 'in_delivery'),
      }),
    ]);
    return { all, inAuction, sold, inDelivery };
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
      status: ProductStatus.PUBLISHED,
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

    where.orders = {
      none: {
        status: OrderStatus.DELIVERED,
        deletedAt: null,
      },
    };

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

    const now = new Date();
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
          auctions: {
            where: { deletedAt: null },
            take: 1,
            orderBy: { endTime: 'desc' },
            select: {
              id: true,
              endTime: true,
              status: true,
              durationHours: true,
              currentPrice: true,
              totalBids: true,
              winner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
          },
          orders: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            where: { deletedAt: null },
            select: {
              id: true,
              status: true,
              deliveredAt: true,
              shippedAt: true,
            },
          },
        },
      }),
      this.productRepository.count({ where }),
    ]);

    type ProductWithActiveAuction = (typeof products)[number] & {
      auctions?: Array<{
        id: string;
        endTime: Date;
        status: string;
        durationHours: number;
        currentPrice: unknown;
        totalBids: number;
        winner: {
          id: string;
          firstName: string | null;
          lastName: string | null;
          phoneNumber: string;
        } | null;
      }>;
      orders?: Array<{
        id: string;
        status: string;
        deliveredAt: Date | null;
        shippedAt: Date | null;
      }>;
    };

    return {
      data: products.map((product) => {
        const p = product as ProductWithActiveAuction;
        const lastOrder = p.orders?.[0];
        const activeAuction = p.auctions?.[0];
        const isAuctionActive =
          activeAuction &&
          ((activeAuction.status === AuctionStatus.ACTIVE &&
            activeAuction.endTime >= now) ||
            activeAuction.status === AuctionStatus.PENDING);
        let saleStatus:
          | 'available'
          | 'onAuction'
          | 'awaitingDelivery'
          | 'sold' = 'available';
        if (isAuctionActive) {
          saleStatus = 'onAuction';
        } else if (activeAuction?.status === 'ENDED') {
          saleStatus = 'sold';
        } else if (lastOrder) {
          if (lastOrder.status === OrderStatus.DELIVERED) {
            saleStatus = 'sold';
          } else if (
            lastOrder.status === OrderStatus.PROCESSING ||
            lastOrder.status === OrderStatus.SHIPPED
          ) {
            saleStatus = 'awaitingDelivery';
          }
        }
        return ProductResponseDto.fromEntity({
          ...p,
          activeAuction,
          saleOrderSummary: lastOrder
            ? {
                id: lastOrder.id,
                status: lastOrder.status,
                deliveredAt: lastOrder.deliveredAt,
                shippedAt: lastOrder.shippedAt,
              }
            : undefined,
          saleStatus,
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
  }

  async moderateProduct(
    id: string,
    userId: string,
    userRole: UserRole,
    dto: { action: 'approve' | 'reject'; rejectionReason?: string },
  ): Promise<ProductResponseDto> {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.MODERATOR) {
      throw new ForbiddenException(
        'Only admins and moderators can moderate products',
      );
    }
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          where: { deletedAt: null, isActive: true },
          take: 1,
          orderBy: { displayOrder: 'asc' },
          include: { file: { select: { url: true } } },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== ProductStatus.PENDING) {
      throw new BadRequestException('Product is not pending moderation');
    }
    if (dto.action === 'reject' && !dto.rejectionReason?.trim()) {
      throw new BadRequestException(
        'rejectionReason is required when rejecting',
      );
    }

    if (dto.action === 'approve') {
      await this.prisma.product.update({
        where: { id },
        data: {
          status: ProductStatus.PUBLISHED,
          moderationRejectionReason: null,
          moderationRejectedAt: null,
          moderationRejectedById: null,
        },
      });

      const title =
        resolveTranslation(product.title as Record<string, string>, null) ?? '';

      try {
        await this.notificationService.notifyProductApproved({
          sellerId: product.sellerId,
          productId: product.id,
          productTitle: title || undefined,
        });
      } catch (err) {
        this.logger.warn(
          `Failed to send moderation approval push for product ${id}: ${err instanceof Error ? err.message : err}`,
        );
      }

      return this.findById(id);
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        status: ProductStatus.REJECTED,
        moderationRejectionReason: dto.rejectionReason?.trim() ?? null,
        moderationRejectedAt: new Date(),
        moderationRejectedById: userId,
      },
    });

    const title =
      resolveTranslation(product.title as Record<string, string>, null) ?? '';
    const imageUrl = product.images?.[0]?.file?.url ?? null;
    const price =
      typeof product.price === 'object' &&
      product.price &&
      'toNumber' in product.price
        ? (product.price as { toNumber: () => number }).toNumber()
        : Number(product.price);
    try {
      await this.conversationService.notifyProductModerationRejected(
        product.sellerId,
        {
          id: product.id,
          title: title || undefined,
          imageUrl,
          price,
          currency: product.currency,
        },
        dto.rejectionReason?.trim() ?? 'Not specified',
      );

      await this.notificationService.notifyProductRejected({
        sellerId: product.sellerId,
        productId: product.id,
        productTitle: title || undefined,
        reason: dto.rejectionReason?.trim() ?? 'Not specified',
      });
    } catch (err) {
      this.logger.warn(
        `Failed to send moderation rejection for product ${id}: ${err instanceof Error ? err.message : err}`,
      );
    }
    return this.findById(id);
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

    const activeAuction = await this.prisma.auction.findFirst({
      where: {
        productId: id,
        deletedAt: null,
      },
      orderBy: { endTime: 'desc' },
      select: {
        id: true,
        endTime: true,
        status: true,
        currentPrice: true,
        totalBids: true,
        winner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    const lastOrder = await this.prisma.order.findFirst({
      where: {
        productId: id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        status: true,
      },
    });

    const now = new Date();
    const isAuctionActive =
      activeAuction &&
      ((activeAuction.status === AuctionStatus.ACTIVE &&
        activeAuction.endTime >= now) ||
        activeAuction.status === AuctionStatus.PENDING);
    let saleStatus: 'available' | 'onAuction' | 'awaitingDelivery' | 'sold' =
      'available';
    if (isAuctionActive) {
      saleStatus = 'onAuction';
    } else if (activeAuction?.status === 'ENDED') {
      saleStatus = 'sold';
    } else if (lastOrder) {
      if (lastOrder.status === OrderStatus.DELIVERED) {
        saleStatus = 'sold';
      } else if (
        lastOrder.status === OrderStatus.PROCESSING ||
        lastOrder.status === OrderStatus.SHIPPED
      ) {
        saleStatus = 'awaitingDelivery';
      }
    }

    if (incrementViews) {
      await this.productRepository.incrementViews(id);
    }

    const result = ProductResponseDto.fromEntity({
      ...productWithRelations,
      activeAuction: activeAuction ?? undefined,
      saleStatus,
    } as typeof productWithRelations & {
      activeAuction?: {
        id: string;
        endTime: Date;
        status: string;
        durationHours: number;
        currentPrice: unknown;
        totalBids: number;
        winner: {
          id: string;
          firstName: string | null;
          lastName: string | null;
          phoneNumber: string;
        } | null;
      };
      saleStatus: 'available' | 'onAuction' | 'awaitingDelivery' | 'sold';
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

    const canUpdateAny =
      userRole === UserRole.ADMIN || userRole === UserRole.MODERATOR;
    if (product.sellerId !== userId && !canUpdateAny) {
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
    if (dto.status !== undefined && canUpdateAny) {
      updateData.status = dto.status;
    }
    const isRejected =
      (product.status === ProductStatus.DRAFT ||
        product.status === ProductStatus.REJECTED) &&
      product.moderationRejectedAt != null;
    if (
      isRejected &&
      product.sellerId === userId &&
      (validatedImageIds !== undefined || Object.keys(updateData).length > 0)
    ) {
      updateData.status = ProductStatus.PENDING;
      updateData.moderationRejectionReason = null;
      updateData.moderationRejectedAt = null;
      updateData.moderationRejectedById = null;
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
        where: { productId: id, status: { in: ['ACTIVE', 'PENDING'] } },
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

    const canDeleteAny =
      userRole === UserRole.ADMIN || userRole === UserRole.MODERATOR;
    if (product.sellerId !== userId && !canDeleteAny) {
      throw new ForbiddenException('You can only delete your own products');
    }

    const activeAuctions = await this.prisma.auction.count({
      where: {
        productId: id,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (activeAuctions > 0) {
      throw new BadRequestException(
        'Cannot delete product with active auctions',
      );
    }

    await this.productRepository.softDelete(id, userId);
  }

  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
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
