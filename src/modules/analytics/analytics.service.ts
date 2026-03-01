import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationService } from '../conversation/conversation.service';
import {
  AnalyticsDashboardDto,
  PeriodStatsDto,
  WeekPeriodStatsDto,
  TotalsDto,
  CustomPeriodStatsDto,
} from './dto/analytics-dashboard.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
  ) {}

  async getDashboard(
    query?: AnalyticsQueryDto,
  ): Promise<AnalyticsDashboardDto> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfToday);
    const dayOfWeek = startOfWeek.getUTCDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() + mondayOffset);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const usersOnlineNow = this.conversationService.getOnlineUserIds().size;

    const [
      totalUsers,
      totalBouquets,
      bouquetsToday,
      bouquetsWeek,
      bidsToday,
      bidsWeek,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({
        where: {
          createdAt: { gte: startOfToday },
          deletedAt: null,
        },
      }),
      this.prisma.product.count({
        where: {
          createdAt: { gte: startOfWeek },
          deletedAt: null,
        },
      }),
      this.prisma.bid.count({
        where: {
          createdAt: { gte: startOfToday },
          deletedAt: null,
        },
      }),
      this.prisma.bid.count({
        where: {
          createdAt: { gte: startOfWeek },
          deletedAt: null,
        },
      }),
    ]);

    const todayLabel = this.formatDateLabel(startOfToday);
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const weekMonth = monthNames[startOfWeek.getUTCMonth()];
    const weekLabel =
      startOfWeek.getUTCDate() === now.getUTCDate() &&
      startOfWeek.getUTCMonth() === now.getUTCMonth()
        ? todayLabel
        : `${startOfWeek.getUTCDate()} - ${now.getUTCDate()} ${weekMonth}`;

    const today: PeriodStatsDto = {
      date: startOfToday.toISOString().slice(0, 10),
      label: todayLabel,
      usersOnline: usersOnlineNow,
      bouquetsAdded: bouquetsToday,
      bidsCount: bidsToday,
    };

    const week: WeekPeriodStatsDto = {
      dateFrom: startOfWeek.toISOString().slice(0, 10),
      dateTo: now.toISOString().slice(0, 10),
      label: weekLabel,
      usersOnline: usersOnlineNow,
      bouquetsAdded: bouquetsWeek,
      bidsCount: bidsWeek,
    };

    const totals: TotalsDto = {
      totalUsers,
      totalBouquets,
    };

    let customPeriod: CustomPeriodStatsDto | undefined;
    if (query?.dateFrom && query?.dateTo) {
      const from = new Date(query.dateFrom);
      const to = new Date(query.dateTo);
      to.setUTCHours(23, 59, 59, 999);
      if (from <= to) {
        const [bouquetsRange, bidsRange] = await Promise.all([
          this.prisma.product.count({
            where: {
              createdAt: { gte: from, lte: to },
              deletedAt: null,
            },
          }),
          this.prisma.bid.count({
            where: { createdAt: { gte: from, lte: to } },
          }),
        ]);
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        const label =
          from.getUTCMonth() === to.getUTCMonth() &&
          from.getUTCFullYear() === to.getUTCFullYear()
            ? `${from.getUTCDate()} - ${to.getUTCDate()} ${monthNames[from.getUTCMonth()]}`
            : `${from.getUTCDate()} ${monthNames[from.getUTCMonth()]} - ${to.getUTCDate()} ${monthNames[to.getUTCMonth()]}`;
        customPeriod = {
          dateFrom: query.dateFrom.slice(0, 10),
          dateTo: query.dateTo.slice(0, 10),
          label,
          bouquetsAdded: bouquetsRange,
          bidsCount: bidsRange,
        };
      }
    }

    return { today, week, totals, customPeriod };
  }

  private formatDateLabel(d: Date): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
  }
}
