import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { OrderRepository } from './repositories/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import {
  Prisma,
  OrderStatus,
  PaymentStatus,
  UserRole,
  MessageType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductRepository } from '../product/repositories/product.repository';
import { AuctionRepository } from '../auction/repositories/auction.repository';
import { ConversationService } from '../conversation/conversation.service';
import { NotificationService } from '../notification/notification.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly prisma: PrismaService,
    private readonly productRepository: ProductRepository,
    private readonly auctionRepository: AuctionRepository,
    private readonly conversationService: ConversationService,
    private readonly notificationService: NotificationService,
    @InjectQueue('conversation') private readonly conversationQueue: Queue,
  ) {}

  async createOrderFromAuctionWinner(params: {
    auctionId: string;
    productId: string;
    buyerId: string;
    amount: number;
  }): Promise<{ id: string; amount: number }> {
    const { auctionId, productId, buyerId, amount } = params;

    const existingOrder = await this.prisma.order.findFirst({
      where: {
        auctionId,
        buyerId,
        status: { not: 'CANCELLED' },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingOrder) {
      throw new ConflictException(
        'Order already exists for this auction winner',
      );
    }

    const auction = await this.auctionRepository.findById(auctionId);
    if (!auction || auction.deletedAt) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.status !== 'ENDED') {
      throw new BadRequestException('Auction must be ended to create order');
    }

    if (auction.winnerId !== buyerId) {
      throw new BadRequestException(
        'Buyer must be the auction winner to create this order',
      );
    }

    const winningBid = await this.prisma.bid.findFirst({
      where: {
        auctionId,
        bidderId: buyerId,
        isWinning: true,
        isRetracted: false,
      },
      orderBy: { amount: 'desc' },
    });

    if (!winningBid) {
      throw new BadRequestException('No winning bid found for this buyer');
    }

    if (Number(winningBid.amount) !== amount) {
      throw new BadRequestException(
        `Order amount must match winning bid amount: ${Number(winningBid.amount)}`,
      );
    }

    const orderNumber = await this.orderRepository.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        buyer: { connect: { id: buyerId } },
        product: { connect: { id: productId } },
        auction: { connect: { id: auctionId } },
        amount,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PENDING,
        shippingAddress: null,
        notes: null,
      },
    });

    this.logger.log(
      `Order created from auction winner: ${order.id} (${orderNumber}) for auction ${auctionId}, buyer ${buyerId}, amount: ${amount}`,
    );

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        sellerId: true,
        title: true,
        price: true,
        images: {
          take: 1,
          orderBy: { displayOrder: 'asc' as const },
          select: { file: { select: { url: true } } },
        },
      },
    });

    if (!product || !product.sellerId) {
      this.logger.warn(
        `Product ${productId} not found after auction order creation ${order.id}, skipping order banner notification`,
      );
      return { id: order.id, amount };
    }

    await this.conversationService
      .createConversationForOrder(order.id)
      .catch((err) => {
        this.logger.warn(
          `Failed to create chat for auction order ${order.id}: ${err?.message ?? err}`,
        );
      });

    try {
      await this.sendOrderBannerNotification(
        order.id,
        product,
        buyerId,
        product.sellerId,
      );
    } catch (err) {
      this.logger.warn(
        `Failed to send order banner notification for auction order ${order.id}: ${err instanceof Error ? err.message : err}`,
      );
    }

    return { id: order.id, amount };
  }

  async createOrder(
    dto: CreateOrderDto,
    buyerId: string,
    role?: UserRole,
  ): Promise<OrderResponseDto> {
    const product = await this.productRepository.findById(dto.productId);

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'PUBLISHED') {
      throw new BadRequestException('Product is not available for purchase');
    }

    if (product.sellerId === buyerId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot purchase your own product');
    }

    let auction = null;
    if (dto.auctionId) {
      auction = await this.auctionRepository.findById(dto.auctionId);

      if (!auction || auction.deletedAt) {
        throw new NotFoundException('Auction not found');
      }

      if (auction.productId !== dto.productId) {
        throw new BadRequestException('Auction does not match the product');
      }

      if (auction.status !== 'ENDED') {
        throw new BadRequestException(
          'Order can only be created from ended auctions',
        );
      }

      if (auction.winnerId !== buyerId) {
        throw new ForbiddenException(
          'Only the auction winner can create an order',
        );
      }
    }

    const orderNumber = await this.orderRepository.generateOrderNumber();
    const amount = dto.amount;

    if (auction) {
      const winningBid = await this.prisma.bid.findFirst({
        where: {
          auctionId: dto.auctionId,
          bidderId: buyerId,
          isWinning: true,
          isRetracted: false,
        },
        orderBy: {
          amount: 'desc',
        },
      });

      if (winningBid && Number(winningBid.amount) !== amount) {
        throw new BadRequestException(
          `Order amount must match winning bid amount: ${Number(winningBid.amount)}`,
        );
      }
    } else {
      if (Number(product.price) !== amount) {
        throw new BadRequestException(
          `Order amount must match product price: ${Number(product.price)}`,
        );
      }
    }

    const order = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        if (dto.auctionId) {
          const existingOrder = await tx.order.findFirst({
            where: {
              auctionId: dto.auctionId,
              buyerId,
              status: {
                not: 'CANCELLED',
              },
              deletedAt: null,
            },
            select: { id: true },
          });

          if (existingOrder) {
            throw new ConflictException(
              'Order already exists for this auction',
            );
          }
        } else {
          const existingProcessingOrder = await tx.order.findFirst({
            where: {
              productId: dto.productId,
              buyerId,
              status: 'PROCESSING',
              deletedAt: null,
            },
            select: { id: true },
          });

          if (existingProcessingOrder) {
            throw new ConflictException(
              'You already have an active processing order for this product',
            );
          }
        }

        return tx.order.create({
          data: {
            orderNumber,
            buyer: {
              connect: { id: buyerId },
            },
            product: {
              connect: { id: dto.productId },
            },
            auction: dto.auctionId
              ? {
                  connect: { id: dto.auctionId },
                }
              : undefined,
            amount,
            status: OrderStatus.PROCESSING,
            paymentStatus: PaymentStatus.PENDING,
            shippingAddress: dto.shippingAddress,
            notes: dto.notes,
          },
        });
      },
    );

    this.logger.log(
      `Order created: ${order.id} (${orderNumber}) for product ${dto.productId} by user ${buyerId}. Amount: ${amount}`,
    );

    if (!dto.auctionId) {
      this.logger.log(
        `Purchase request created for product ${dto.productId}. Seller: ${product.sellerId}`,
      );
    }

    await this.conversationService
      .createConversationForOrder(order.id)
      .catch((err) => {
        this.logger.warn(
          `Failed to create chat for order ${order.id}: ${err?.message ?? err}`,
        );
      });

    try {
      await this.sendOrderBannerNotification(
        order.id,
        product,
        buyerId,
        product.sellerId,
      );
    } catch (err) {
      this.logger.warn(
        `Failed to send order banner notification for order ${order.id}: ${err instanceof Error ? err.message : err}`,
      );
    }

    return this.findById(order.id);
  }

  async findAll(query: OrderQueryDto, userId?: string, userRole?: UserRole) {
    const {
      page = 1,
      limit = 20,
      buyerId,
      productId,
      auctionId,
      status,
      paymentStatus,
      createdAfter,
      createdBefore,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (buyerId) {
      where.buyerId = buyerId;
    } else if (userId && userRole !== UserRole.ADMIN) {
      const userProducts = await this.prisma.product.findMany({
        where: {
          sellerId: userId,
          deletedAt: null,
        },
        select: { id: true },
      });
      const productIds = userProducts.map((p) => p.id);

      where.OR = [
        { buyerId: userId },
        ...(productIds.length > 0 ? [{ productId: { in: productIds } }] : []),
      ];
    }

    if (productId) {
      where.productId = productId;
    }

    if (auctionId) {
      where.auctionId = auctionId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) {
        where.createdAt.gte = new Date(createdAfter);
      }
      if (createdBefore) {
        where.createdAt.lte = new Date(createdBefore);
      }
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: maxLimit,
        orderBy,
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              sellerId: true,
              images: {
                include: {
                  file: {
                    select: {
                      url: true,
                    },
                  },
                },
                orderBy: { displayOrder: 'asc' },
                take: 1,
              },
            },
          },
          auction: {
            select: {
              id: true,
              productId: true,
              status: true,
            },
          },
        },
      }),
      this.orderRepository.count({ where }),
    ]);

    const sellerIds = [
      ...new Set(
        orders
          .map((order) => order.product?.sellerId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const sellers = await this.prisma.user.findMany({
      where: {
        id: { in: sellerIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
    });

    const sellerMap = new Map(sellers.map((seller) => [seller.id, seller]));

    const ordersWithSeller = orders.map((order) => {
      const seller = order.product?.sellerId
        ? sellerMap.get(order.product.sellerId)
        : undefined;
      return { ...order, seller };
    });

    return {
      data: ordersWithSeller.map((order) =>
        OrderResponseDto.fromEntity(
          order as Parameters<typeof OrderResponseDto.fromEntity>[0],
        ),
      ),
      meta: {
        total,
        page,
        limit: maxLimit,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  async findById(
    id: string,
    userId?: string,
    userRole?: UserRole,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            sellerId: true,
            images: {
              include: {
                file: {
                  select: {
                    url: true,
                  },
                },
              },
              orderBy: { displayOrder: 'asc' },
              take: 5,
            },
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
        auction: {
          select: {
            id: true,
            productId: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.deletedAt) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (userId && userRole !== UserRole.ADMIN) {
      if (order.buyerId !== userId && order.product.sellerId !== userId) {
        throw new ForbiddenException(
          'You can only view your own orders or orders for your products',
        );
      }
    }

    return OrderResponseDto.fromEntity({
      ...order,
      seller: order.product.seller ?? undefined,
    });
  }

  async updateOrder(
    id: string,
    dto: UpdateOrderDto,
    userId: string,
    userRole: UserRole,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);

    if (!order || order.deletedAt) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const product = await this.productRepository.findById(order.productId);

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    const isBuyer = order.buyerId === userId;
    const isSeller = product.sellerId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenException(
        'You can only update your own orders or orders for your products',
      );
    }

    const updateData: Prisma.OrderUpdateInput = {};

    if (dto.status !== undefined) {
      this.validateStatusTransition(order.status, dto.status);

      if (order.status === 'CANCELLED' && dto.status !== 'CANCELLED') {
        throw new BadRequestException(
          'Cannot change status of cancelled order',
        );
      }

      if (order.status === 'DELIVERED' && dto.status !== 'DELIVERED') {
        throw new BadRequestException(
          'Cannot change status of completed delivery order',
        );
      }

      if (dto.status === 'PROCESSING' && !isSeller && !isAdmin) {
        throw new ForbiddenException(
          'Only seller can move order to processing',
        );
      }

      if (dto.status === 'SHIPPED' && !isSeller && !isAdmin) {
        throw new ForbiddenException('Only seller can mark order as shipped');
      }

      if (dto.status === 'DELIVERED' && !isSeller && !isAdmin) {
        throw new ForbiddenException(
          'Only seller can mark order as delivery completed',
        );
      }

      if (dto.status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        updateData.cancelledBy = userId;
        if (dto.cancellationReason) {
          updateData.cancellationReason = dto.cancellationReason;
        }
      }

      if (dto.status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
        updateData.completedAt = new Date();
      }

      updateData.status = dto.status;
    }

    if (dto.paymentStatus !== undefined) {
      if (dto.paymentStatus === 'COMPLETED') {
        updateData.paymentStatus = dto.paymentStatus;
      } else {
        updateData.paymentStatus = dto.paymentStatus;
      }
    }

    if (dto.shippingAddress !== undefined) {
      if (!isBuyer && !isAdmin) {
        throw new ForbiddenException('Only buyer can update shipping address');
      }
      updateData.shippingAddress = dto.shippingAddress;
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    if (dto.shippedAt !== undefined) {
      if (!isSeller && !isAdmin) {
        throw new ForbiddenException('Only seller can update shipped date');
      }
      updateData.shippedAt = new Date(dto.shippedAt);
      if (order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
        updateData.status = 'SHIPPED';
      }
    }

    if (dto.deliveredAt !== undefined) {
      if (!isSeller && !isAdmin) {
        throw new ForbiddenException('Only seller can update delivery date');
      }
      updateData.deliveredAt = new Date(dto.deliveredAt);
      updateData.completedAt = new Date(dto.deliveredAt);
      if (order.status !== 'DELIVERED') {
        updateData.status = 'DELIVERED';
      }
    }

    if (dto.cancellationReason !== undefined && dto.status === 'CANCELLED') {
      updateData.cancellationReason = dto.cancellationReason;
    }

    await this.orderRepository.update(id, updateData);

    const newStatus = (updateData.status as OrderStatus) ?? order.status;
    const statusChanged =
      updateData.status !== undefined && newStatus !== order.status;
    const notifyParams = {
      buyerId: order.buyerId,
      orderId: id,
      orderNumber: order.orderNumber,
      productId: order.productId,
      productTitle: this.getProductTitleForNotify(product),
    };

    if (statusChanged && newStatus === 'PROCESSING') {
      this.notificationService
        .notifyOrderConfirmed(notifyParams)
        .catch((err) => {
          this.logger.warn(
            `Failed to send ORDER_CONFIRMED notification for order ${id}`,
            err instanceof Error ? err.message : String(err),
          );
        });
    } else if (statusChanged && newStatus === 'SHIPPED') {
      this.notificationService.notifyOrderShipped(notifyParams).catch((err) => {
        this.logger.warn(
          `Failed to send ORDER_SHIPPED notification for order ${id}`,
          err instanceof Error ? err.message : String(err),
        );
      });
    } else if (statusChanged && newStatus === 'DELIVERED') {
      this.notificationService
        .notifyOrderDelivered(notifyParams)
        .catch((err) => {
          this.logger.warn(
            `Failed to send ORDER_DELIVERED notification for order ${id}`,
            err instanceof Error ? err.message : String(err),
          );
        });
      this.conversationQueue
        .add('deactivate-conversation-by-order', {
          orderId: id,
          productId: order.productId,
        })
        .catch((err) => {
          this.logger.warn(
            `Failed to schedule conversation deactivation for order ${id}`,
            err instanceof Error ? err.message : err,
          );
        });
    } else if (statusChanged && newStatus === 'CANCELLED') {
      this.notificationService
        .notifyOrderCancelled(notifyParams)
        .catch((err) => {
          this.logger.warn(
            `Failed to send ORDER_CANCELLED notification for order ${id}`,
            err instanceof Error ? err.message : String(err),
          );
        });
    }

    this.logger.log(
      `Order ${id} updated by ${isBuyer ? 'buyer' : isSeller ? 'seller' : 'admin'}. Status: ${dto.status ?? order.status}`,
    );

    return this.findById(id);
  }

  async deleteOrder(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (!order || order.deletedAt) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const product = await this.productRepository.findById(order.productId);

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    if (
      order.buyerId !== userId &&
      product.sellerId !== userId &&
      userRole !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'You can only delete your own orders or orders for your products',
      );
    }

    if (order.status === 'DELIVERED') {
      throw new BadRequestException('Cannot delete completed delivery orders');
    }

    await this.orderRepository.softDelete(id, userId);

    this.logger.log(`Order ${id} deleted by user ${userId}`);
  }

  private async sendOrderBannerNotification(
    orderId: string,
    product: {
      title?: unknown;
      price: unknown;
      images?: { file?: { url: string } }[];
    },
    buyerId: string,
    sellerId: string,
  ): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            phoneNumber: true,
            phoneCountryCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found for banner notification`);
      return;
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: { orderId, deletedAt: null },
      select: { id: true },
    });

    if (!conversation) {
      this.logger.warn(`Conversation not found for order ${orderId}`);
      return;
    }

    const productTitle =
      typeof product.title === 'object' && product.title
        ? ((product.title as Record<string, string>).ru ??
          (product.title as Record<string, string>).en ??
          (product.title as Record<string, string>).uz ??
          (Object.values(
            product.title as Record<string, unknown>,
          )[0] as string) ??
          '')
        : typeof product.title === 'string'
          ? product.title
          : '';

    const productPrice =
      typeof product.price === 'object' &&
      product.price &&
      'toNumber' in product.price
        ? (product.price as { toNumber: () => number }).toNumber()
        : Number(product.price);

    const productImage = product.images?.[0]?.file?.url ?? null;

    const buyerPhone = order.buyer.phoneCountryCode
      ? `${order.buyer.phoneCountryCode}${order.buyer.phoneNumber}`
      : order.buyer.phoneNumber;

    const bannerMetadata = {
      type: 'ORDER_CREATED',
      orderId: order.id,
      orderNumber: order.orderNumber,
      productId: order.productId,
      status: order.status,
      sellerId,
      product: {
        title: productTitle,
        price: productPrice,
        image: productImage,
      },
      buyer: {
        username: order.buyer.username ?? null,
        firstName: order.buyer.firstName,
        lastName: order.buyer.lastName,
        phone: buyerPhone,
      },
    };

    await this.conversationService.sendMessageAsSender(
      conversation.id,
      buyerId,
      `Новый заказ #${order.orderNumber}`,
      bannerMetadata,
      MessageType.SYSTEM,
    );

    await this.conversationService.sendMessageAsSender(
      conversation.id,
      sellerId,
      `Заказ #${order.orderNumber} принят`,
      bannerMetadata,
      MessageType.SYSTEM,
    );

    this.logger.log(
      `Order banner notification sent for order ${orderId} in conversation ${conversation.id} to both seller and buyer`,
    );
  }

  private getProductTitleForNotify(product: { title?: unknown }): string {
    const t = product.title as Record<string, string> | null | undefined;
    if (!t || typeof t !== 'object') return '';
    return t.ru ?? t.en ?? t.uz ?? Object.values(t)[0] ?? '';
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowedStatuses = validTransitions[currentStatus] ?? [];

    if (!allowedStatuses.includes(newStatus) && currentStatus !== newStatus) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedStatuses.join(', ')}`,
      );
    }
  }
}
