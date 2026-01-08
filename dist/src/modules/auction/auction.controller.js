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
exports.AuctionController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const auction_service_1 = require("./auction.service");
const create_auction_dto_1 = require("./dto/create-auction.dto");
const update_auction_dto_1 = require("./dto/update-auction.dto");
const auction_query_dto_1 = require("./dto/auction-query.dto");
const auction_response_dto_1 = require("./dto/auction-response.dto");
const participant_response_dto_1 = require("./dto/participant-response.dto");
const winner_response_dto_1 = require("./dto/winner-response.dto");
const leaderboard_response_dto_1 = require("./dto/leaderboard-response.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const sanitize_pipe_1 = require("../../common/pipes/sanitize.pipe");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
let AuctionController = class AuctionController {
    auctionService;
    constructor(auctionService) {
        this.auctionService = auctionService;
    }
    async create(createAuctionDto, userId) {
        return await this.auctionService.createAuction(createAuctionDto, userId);
    }
    async findAll(query) {
        return await this.auctionService.findAll(query);
    }
    async getParticipants(id) {
        return await this.auctionService.getParticipants(id);
    }
    async getWinners(id) {
        return await this.auctionService.getWinners(id);
    }
    async getLeaderboard(id, limit) {
        const limitNum = limit ? parseInt(limit, 10) : undefined;
        return await this.auctionService.getLeaderboard(id, limitNum);
    }
    async findOne(id, incrementViews) {
        return await this.auctionService.findById(id, incrementViews === 'true');
    }
    async update(id, updateAuctionDto, userId, role) {
        return await this.auctionService.updateAuction(id, updateAuctionDto, userId, role);
    }
    async remove(id, userId, role) {
        return await this.auctionService.deleteAuction(id, userId, role);
    }
};
exports.AuctionController = AuctionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new auction' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: true }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Auction created successfully',
        type: auction_response_dto_1.AuctionResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: require("./dto/auction-response.dto").AuctionResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_auction_dto_1.CreateAuctionDto, String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all auctions' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({
        unauthorized: false,
        forbidden: false,
        notFound: false,
        conflict: false,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of auctions' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auction_query_dto_1.AuctionQueryDto]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/participants'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get auction participants',
        description: 'Returns list of all bidders who placed bids, grouped by user with their bid counts and highest bid amount',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of participants with bid statistics',
        type: participant_response_dto_1.ParticipantsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Auction not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/participant-response.dto").ParticipantsResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getParticipants", null);
__decorate([
    (0, common_1.Get)(':id/winners'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get top winners',
        description: 'Returns top 3 bidders ranked by highest bid amount. Used for displaying winners leaderboard.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Top 3 winners ranked by bid amount',
        type: winner_response_dto_1.WinnersResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Auction not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/winner-response.dto").WinnersResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getWinners", null);
__decorate([
    (0, common_1.Get)(':id/leaderboard'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get auction leaderboard',
        description: 'Returns all bidders ranked by highest bid amount, with their bid counts and statistics',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Maximum number of entries to return (default: all, max: 100)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leaderboard of all bidders ranked by bid amount',
        type: leaderboard_response_dto_1.LeaderboardResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Auction not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/leaderboard-response.dto").LeaderboardResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get auction by ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'incrementViews',
        required: false,
        type: Boolean,
        description: 'Whether to increment the view count',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Auction details',
        type: auction_response_dto_1.AuctionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Auction not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/auction-response.dto").AuctionResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('incrementViews')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update auction' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Auction updated',
        type: auction_response_dto_1.AuctionResponseDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/auction-response.dto").AuctionResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_auction_dto_1.UpdateAuctionDto, String, String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete auction' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Auction deleted' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AuctionController.prototype, "remove", null);
exports.AuctionController = AuctionController = __decorate([
    (0, swagger_1.ApiTags)('Auctions'),
    (0, common_1.Controller)('auctions'),
    __metadata("design:paramtypes", [auction_service_1.AuctionService])
], AuctionController);
//# sourceMappingURL=auction.controller.js.map