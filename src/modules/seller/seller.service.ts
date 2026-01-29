import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SellerStatisticsDto } from './dto/seller-statistics.dto';
import { SellerIncomeDto } from './dto/seller-income.dto';
import { SellerActivityDto } from './dto/seller-activity.dto';
import { SellerDashboardDto } from './dto/seller-dashboard.dto';
import { OrderResponseDto } from '../order/dto/order-response.dto';
import { AuctionResponseDto } from '../auction/dto/auction-response.dto';

@Injectable()
export class SellerService {
  private readonly logger = new Logger(SellerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStatistics(sellerId: string): Promise<SellerStatisticsDto> {
    const statsResult = await this.prisma.$queryRaw<
      Array<{
        total_products: bigint;
        active_products: bigint;
        inactive_products: bigint;
        total_views: bigint;
        total_orders: bigint;
        pending_orders: bigint;
        active_auctions: bigint;
        completed_auctions: bigint;
      }>
    >`
      SELECT
        (SELECT COUNT(*) FROM products WHERE seller_id = ${sellerId} AND deleted_at IS NULL) as total_products,
        (SELECT COUNT(*) FROM products WHERE seller_id = ${sellerId} AND status = 'ACTIVE' AND deleted_at IS NULL) as active_products,
        (SELECT COUNT(*) FROM products WHERE seller_id = ${sellerId} AND status IN ('INACTIVE', 'SOLD') AND deleted_at IS NULL) as inactive_products,
        (SELECT COALESCE(SUM(views), 0) FROM products WHERE seller_id = ${sellerId} AND deleted_at IS NULL) as total_views,
        (SELECT COUNT(*) FROM orders o INNER JOIN products p ON o.product_id = p.id WHERE p.seller_id = ${sellerId} AND o.deleted_at IS NULL) as total_orders,
        (SELECT COUNT(*) FROM orders o INNER JOIN products p ON o.product_id = p.id WHERE p.seller_id = ${sellerId} AND o.status = 'PENDING' AND o.deleted_at IS NULL) as pending_orders,
        (SELECT COUNT(*) FROM auctions WHERE creator_id = ${sellerId} AND status = 'ACTIVE' AND deleted_at IS NULL AND end_time >= NOW()) as active_auctions,
        (SELECT COUNT(*) FROM auctions WHERE creator_id = ${sellerId} AND status IN ('ENDED', 'CANCELLED') AND deleted_at IS NULL) as completed_auctions
    `;

    const stats = statsResult[0] || {
      total_products: 0n,
      active_products: 0n,
      inactive_products: 0n,
      total_views: 0n,
      total_orders: 0n,
      pending_orders: 0n,
      active_auctions: 0n,
      completed_auctions: 0n,
    };

    return {
      totalProducts: Number(stats.total_products),
      activeProducts: Number(stats.active_products),
      inactiveProducts: Number(stats.inactive_products),
      totalViews: Number(stats.total_views),
      totalOrders: Number(stats.total_orders),
      pendingOrders: Number(stats.pending_orders),
      activeAuctions: Number(stats.active_auctions),
      completedAuctions: Number(stats.completed_auctions),
    };
  }

  async getIncome(sellerId: string): Promise<SellerIncomeDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const incomeResult = await this.prisma.$queryRaw<
      Array<{
        total_income: bigint;
        pending_income: bigint;
        completed_income: bigint;
        this_month: bigint;
        last_month: bigint;
      }>
    >`
      SELECT
        COALESCE(SUM(o.amount) FILTER (WHERE o.payment_status = 'COMPLETED'), 0) as total_income,
        COALESCE(SUM(o.amount) FILTER (WHERE o.payment_status = 'PENDING'), 0) as pending_income,
        COALESCE(SUM(o.amount) FILTER (WHERE o.payment_status = 'COMPLETED'), 0) as completed_income,
        COALESCE(SUM(o.amount) FILTER (WHERE o.payment_status = 'COMPLETED' AND o.created_at >= ${startOfMonth}), 0) as this_month,
        COALESCE(SUM(o.amount) FILTER (WHERE o.payment_status = 'COMPLETED' AND o.created_at >= ${startOfLastMonth} AND o.created_at <= ${endOfLastMonth}), 0) as last_month
      FROM products pr
      INNER JOIN orders o ON o.product_id = pr.id AND o.deleted_at IS NULL
      WHERE pr.seller_id = ${sellerId} AND pr.deleted_at IS NULL
    `;

    const income = incomeResult[0] || {
      total_income: 0n,
      pending_income: 0n,
      completed_income: 0n,
      this_month: 0n,
      last_month: 0n,
    };

    return {
      totalIncome: Number(income.total_income),
      currency: 'UZS',
      pendingIncome: Number(income.pending_income),
      completedIncome: Number(income.completed_income),
      thisMonth: Number(income.this_month),
      lastMonth: Number(income.last_month),
    };
  }

  async getActivities(
    sellerId: string,
    page = 1,
    limit = 20,
    type?: 'all' | 'orders' | 'auctions',
  ): Promise<SellerActivityDto> {
    const maxLimit = Math.min(limit, 100);
    const skip = (page - 1) * maxLimit;

    const shouldGetOrders = type === 'all' || type === 'orders' || !type;
    const shouldGetAuctions = type === 'all' || type === 'auctions' || !type;

    const ordersLimit = shouldGetOrders
      ? shouldGetAuctions
        ? Math.ceil(maxLimit / 2)
        : maxLimit
      : 0;
    const auctionsLimit = shouldGetAuctions
      ? shouldGetOrders
        ? Math.floor(maxLimit / 2)
        : maxLimit
      : 0;

    const ordersSkip = shouldGetOrders ? skip : 0;
    const auctionsSkip = shouldGetAuctions ? skip : 0;

    const [orders, auctions, ordersCount, auctionsCount] = await Promise.all([
      shouldGetOrders
        ? this.prisma.order.findMany({
            where: {
              product: {
                sellerId,
              },
              deletedAt: null,
            },
            skip: ordersSkip,
            take: ordersLimit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              orderNumber: true,
              buyerId: true,
              productId: true,
              auctionId: true,
              amount: true,
              status: true,
              paymentStatus: true,
              shippingAddress: true,
              notes: true,
              cancelledAt: true,
              cancelledBy: true,
              cancellationReason: true,
              shippedAt: true,
              deliveredAt: true,
              isActive: true,
              deletedAt: true,
              deletedBy: true,
              metadata: true,
              createdAt: true,
              updatedAt: true,
              completedAt: true,
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
                    select: {
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
          })
        : [],
      shouldGetAuctions
        ? this.prisma.auction.findMany({
            where: {
              creatorId: sellerId,
              deletedAt: null,
            },
            skip: auctionsSkip,
            take: auctionsLimit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              productId: true,
              creatorId: true,
              startPrice: true,
              currentPrice: true,
              bidIncrement: true,
              minBidAmount: true,
              startTime: true,
              endTime: true,
              durationHours: true,
              status: true,
              winnerId: true,
              autoExtend: true,
              extendMinutes: true,
              views: true,
              totalBids: true,
              version: true,
              lastBidAt: true,
              isActive: true,
              deletedAt: true,
              deletedBy: true,
              metadata: true,
              createdAt: true,
              updatedAt: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  price: true,
                  images: {
                    select: {
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
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
              winner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
          })
        : [],
      shouldGetOrders
        ? this.prisma.order.count({
            where: {
              product: {
                sellerId,
              },
              deletedAt: null,
            },
          })
        : 0,
      shouldGetAuctions
        ? this.prisma.auction.count({
            where: {
              creatorId: sellerId,
              deletedAt: null,
            },
          })
        : 0,
    ]);

    const orderDtos = orders.map((order) => OrderResponseDto.fromEntity(order));

    const auctionDtos = auctions.map((auction) =>
      AuctionResponseDto.fromEntity(auction),
    );

    return {
      orders: orderDtos,
      auctions: auctionDtos,
      total: ordersCount + auctionsCount,
    };
  }

  async getDashboard(sellerId: string): Promise<SellerDashboardDto> {
    const [statistics, income, recentActivities] = await Promise.all([
      this.getStatistics(sellerId),
      this.getIncome(sellerId),
      this.getActivities(sellerId, 1, 10, 'all'),
    ]);

    return {
      statistics,
      income,
      recentActivities,
    };
  }
}
