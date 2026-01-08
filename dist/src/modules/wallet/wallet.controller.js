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
exports.WalletController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const payment_service_1 = require("../payment/payment.service");
const buy_publications_dto_1 = require("./dto/buy-publications.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const sanitize_pipe_1 = require("../../common/pipes/sanitize.pipe");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
let WalletController = class WalletController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async getBalance(userId) {
        return await this.paymentService.getBalance(userId);
    }
    async buyPublications(buyPublicationsDto, userId) {
        return await this.paymentService.buyPublications(userId, buyPublicationsDto.quantity, buyPublicationsDto.method, buyPublicationsDto.gateway);
    }
    async getTransactions(userId, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return await this.paymentService.findAll({ page: pageNum, limit: limitNum }, userId);
    }
    getPublicationPrice() {
        return {
            price: this.walletService.getPublicationPrice(),
            currency: 'UZS',
        };
    }
    async getTransaction(id, userId) {
        return await this.walletService.getTransactionById(id, userId);
    }
    async verifyTransaction(id, userId) {
        return await this.walletService.verifyTransaction(id, userId);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)('balance'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get wallet balance and publication credits',
        description: 'Returns the current balance and number of available publication credits for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Wallet information retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)('buy-publications'),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Buy publication credits',
        description: 'Purchase a number of publication credits. Each publication costs 30,000 UZS. Can be paid from balance or via payment gateway.',
    }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Publication purchase initiated successfully',
        schema: {
            type: 'object',
            properties: {
                paymentId: {
                    type: 'string',
                    example: 'clx1234567890abcdef',
                },
                paymentUrl: {
                    type: 'string',
                    example: 'https://payme.uz/checkout/...',
                    nullable: true,
                },
                totalAmount: {
                    type: 'number',
                    example: 150000,
                    description: 'Total amount paid for publications',
                },
            },
        },
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [buy_publications_dto_1.BuyPublicationsDto, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "buyPublications", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get payment transactions',
        description: 'Returns paginated list of all payment transactions for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transactions retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('publication-price'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get publication price',
        description: 'Returns the current price per publication',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Publication price retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                price: {
                    type: 'number',
                    example: 30000,
                },
                currency: {
                    type: 'string',
                    example: 'UZS',
                },
            },
        },
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WalletController.prototype, "getPublicationPrice", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction by ID',
        description: 'Returns details of a specific payment transaction',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)('transactions/:id/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify payment transaction',
        description: 'Manually verify a payment transaction status. Usually handled automatically via webhooks.',
    }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction verified',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "verifyTransaction", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('Wallet'),
    (0, common_1.Controller)('wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map