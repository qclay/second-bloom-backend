"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const seller_service_1 = require("./seller.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
const seller_statistics_dto_1 = require("./dto/seller-statistics.dto");
const seller_income_dto_1 = require("./dto/seller-income.dto");
const seller_activity_dto_1 = require("./dto/seller-activity.dto");
const seller_dashboard_dto_1 = require("./dto/seller-dashboard.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ActivityQueryDto {
    page = 1;
    limit = 20;
    type = 'all';
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ActivityQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ActivityQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['all', 'orders', 'auctions']),
    __metadata("design:type", String)
], ActivityQueryDto.prototype, "type", void 0);
let SellerController = class SellerController {
    sellerService;
    constructor(sellerService) {
        this.sellerService = sellerService;
    }
    async getStatistics(userId) {
        return this.sellerService.getStatistics(userId);
    }
    async getIncome(userId) {
        return this.sellerService.getIncome(userId);
    }
    async getActivities(userId, query) {
        return this.sellerService.getActivities(userId, query.page, query.limit, query.type);
    }
    async getDashboard(userId) {
        return this.sellerService.getDashboard(userId);
    }
};
exports.SellerController = SellerController;
__decorate([
    (0, common_1.Get)('me/statistics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get seller statistics',
        description: 'Returns statistics for the authenticated seller including total products, active products, views, orders, and auctions.',
    }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Seller statistics retrieved successfully',
        type: seller_statistics_dto_1.SellerStatisticsDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/seller-statistics.dto").SellerStatisticsDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('me/income'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get seller income information',
        description: 'Returns income statistics for the authenticated seller including total income, pending income, completed income, and monthly breakdown.',
    }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Seller income information retrieved successfully',
        type: seller_income_dto_1.SellerIncomeDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/seller-income.dto").SellerIncomeDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getIncome", null);
__decorate([
    (0, common_1.Get)('me/activities'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get seller activities (orders and auctions)',
        description: 'Returns a combined list of orders and auctions for the authenticated seller. Can filter by type (all, orders, auctions).',
    }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Seller activities retrieved successfully',
        type: seller_activity_dto_1.SellerActivityDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/seller-activity.dto").SellerActivityDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ActivityQueryDto]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getActivities", null);
__decorate([
    (0, common_1.Get)('me/dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get seller dashboard summary',
        description: 'Returns a complete dashboard summary including statistics, income, and recent activities in a single call.',
    }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Seller dashboard retrieved successfully',
        type: seller_dashboard_dto_1.SellerDashboardDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/seller-dashboard.dto").SellerDashboardDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SellerController.prototype, "getDashboard", null);
exports.SellerController = SellerController = __decorate([
    (0, swagger_1.ApiTags)('Sellers'),
    (0, common_1.Controller)('sellers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [seller_service_1.SellerService])
], SellerController);
//# sourceMappingURL=seller.controller.js.map