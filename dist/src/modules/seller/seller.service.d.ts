import { PrismaService } from '../../prisma/prisma.service';
import { SellerStatisticsDto } from './dto/seller-statistics.dto';
import { SellerIncomeDto } from './dto/seller-income.dto';
import { SellerActivityDto } from './dto/seller-activity.dto';
import { SellerDashboardDto } from './dto/seller-dashboard.dto';
export declare class SellerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getStatistics(sellerId: string): Promise<SellerStatisticsDto>;
    getIncome(sellerId: string): Promise<SellerIncomeDto>;
    getActivities(sellerId: string, page?: number, limit?: number, type?: 'all' | 'orders' | 'auctions'): Promise<SellerActivityDto>;
    getDashboard(sellerId: string): Promise<SellerDashboardDto>;
}
