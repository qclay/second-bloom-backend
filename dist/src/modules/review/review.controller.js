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
exports.ReviewController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const review_service_1 = require("./review.service");
const create_review_dto_1 = require("./dto/create-review.dto");
const update_review_dto_1 = require("./dto/update-review.dto");
const review_query_dto_1 = require("./dto/review-query.dto");
const review_response_dto_1 = require("./dto/review-response.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const sanitize_pipe_1 = require("../../common/pipes/sanitize.pipe");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
let ReviewController = class ReviewController {
    reviewService;
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    async create(createReviewDto, userId) {
        return this.reviewService.createReview(createReviewDto, userId);
    }
    async findAll(query) {
        return this.reviewService.findAll(query);
    }
    async findOne(id) {
        return this.reviewService.findById(id);
    }
    async update(id, updateReviewDto, userId, role) {
        return this.reviewService.updateReview(id, updateReviewDto, userId, role);
    }
    async remove(id, userId, role) {
        return this.reviewService.deleteReview(id, userId, role);
    }
    async markHelpful(id, userId) {
        return this.reviewService.markHelpful(id, userId);
    }
};
exports.ReviewController = ReviewController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new review',
        description: 'Creates a review for a product or seller. Requires completed order. Users can only review products they have purchased.',
    }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: true }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Review created successfully',
        type: review_response_dto_1.ReviewResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: require("./dto/review-response.dto").ReviewResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_review_dto_1.CreateReviewDto, String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reviews' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({
        unauthorized: false,
        forbidden: false,
        notFound: false,
        conflict: false,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of reviews' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_query_dto_1.ReviewQueryDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get review by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review details',
        type: review_response_dto_1.ReviewResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Review not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/review-response.dto").ReviewResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update review' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review updated',
        type: review_response_dto_1.ReviewResponseDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/review-response.dto").ReviewResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_review_dto_1.UpdateReviewDto, String, String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete review' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Review deleted' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/helpful'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark review as helpful',
        description: 'Marks a review as helpful. Users can mark reviews to help others identify useful feedback.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Review marked as helpful successfully',
        type: review_response_dto_1.ReviewResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Review not found',
    }),
    openapi.ApiResponse({ status: 201, type: require("./dto/review-response.dto").ReviewResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "markHelpful", null);
exports.ReviewController = ReviewController = __decorate([
    (0, swagger_1.ApiTags)('Reviews'),
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [review_service_1.ReviewService])
], ReviewController);
//# sourceMappingURL=review.controller.js.map