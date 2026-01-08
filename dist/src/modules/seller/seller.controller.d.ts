import { SellerService } from './seller.service';
import { SellerStatisticsDto } from './dto/seller-statistics.dto';
import { SellerIncomeDto } from './dto/seller-income.dto';
import { SellerActivityDto } from './dto/seller-activity.dto';
import { SellerDashboardDto } from './dto/seller-dashboard.dto';
declare class ActivityQueryDto {
    page?: number;
    limit?: number;
    type?: 'all' | 'orders' | 'auctions';
}
export declare class SellerController {
    private readonly sellerService;
    constructor(sellerService: SellerService);
    getStatistics(userId: string): Promise<SellerStatisticsDto>;
    getIncome(userId: string): Promise<SellerIncomeDto>;
    getActivities(userId: string, query: ActivityQueryDto): Promise<SellerActivityDto>;
    getDashboard(userId: string): Promise<SellerDashboardDto>;
}
export {};
