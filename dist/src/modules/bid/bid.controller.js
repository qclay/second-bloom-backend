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
exports.BidController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const bid_service_1 = require("./bid.service");
const create_bid_dto_1 = require("./dto/create-bid.dto");
const bid_query_dto_1 = require("./dto/bid-query.dto");
const bid_response_dto_1 = require("./dto/bid-response.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const sanitize_pipe_1 = require("../../common/pipes/sanitize.pipe");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
let BidController = class BidController {
    bidService;
    constructor(bidService) {
        this.bidService = bidService;
    }
    async create(createBidDto, userId, request) {
        return await this.bidService.createBid(createBidDto, userId, request);
    }
    async getMyBids(query, userId) {
        return await this.bidService.getUserBids(userId, query);
    }
    async getAuctionBids(auctionId) {
        return await this.bidService.getAuctionBids(auctionId);
    }
    async findAll(query) {
        return await this.bidService.findAll(query);
    }
    async findOne(id) {
        return await this.bidService.findById(id);
    }
    async remove(id, userId, role) {
        return await this.bidService.retractBid(id, userId, role);
    }
};
exports.BidController = BidController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Place a bid on an auction' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Bid placed successfully',
        type: bid_response_dto_1.BidResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: require("./dto/bid-response.dto").BidResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bid_dto_1.CreateBidDto, String, Object]),
    __metadata("design:returntype", Promise)
], BidController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-bids'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user bids',
        description: 'Returns all bids placed by the authenticated user, with optional filtering by auction status',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of user bids' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bid_query_dto_1.BidQueryDto, String]),
    __metadata("design:returntype", Promise)
], BidController.prototype, "getMyBids", null);
__decorate([
    (0, common_1.Get)('auction/:auctionId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bids for an auction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of bids for auction' }),
    openapi.ApiResponse({ status: 200, type: [require("./dto/bid-response.dto").BidResponseDto] }),
    __param(0, (0, common_1.Param)('auctionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BidController.prototype, "getAuctionBids", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bids' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({
        unauthorized: false,
        forbidden: false,
        notFound: false,
        conflict: false,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of bids' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bid_query_dto_1.BidQueryDto]),
    __metadata("design:returntype", Promise)
], BidController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get bid by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bid details',
        type: bid_response_dto_1.BidResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bid not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/bid-response.dto").BidResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BidController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retract a bid' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Bid retracted' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BidController.prototype, "remove", null);
exports.BidController = BidController = __decorate([
    (0, swagger_1.ApiTags)('Bids'),
    (0, common_1.Controller)('bids'),
    __metadata("design:paramtypes", [bid_service_1.BidService])
], BidController);
//# sourceMappingURL=bid.controller.js.map