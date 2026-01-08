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
exports.ProductController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const product_service_1 = require("./product.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const product_query_dto_1 = require("./dto/product-query.dto");
const product_search_dto_1 = require("./dto/product-search.dto");
const product_response_dto_1 = require("./dto/product-response.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const sanitize_pipe_1 = require("../../common/pipes/sanitize.pipe");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
let ProductController = class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    async create(createProductDto, userId) {
        return this.productService.createProduct(createProductDto, userId);
    }
    async findAll(query) {
        return this.productService.findAll(query);
    }
    async search(searchDto) {
        return this.productService.searchProducts(searchDto);
    }
    async findOne(id, incrementViews) {
        return this.productService.findById(id, incrementViews === 'true');
    }
    async update(id, updateProductDto, userId, role) {
        return this.productService.updateProduct(id, updateProductDto, userId, role);
    }
    async remove(id, userId, role) {
        return this.productService.deleteProduct(id, userId, role);
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new product' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: true }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Product created successfully',
        type: product_response_dto_1.ProductResponseDto,
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: require("./dto/product-response.dto").ProductResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products (simple query)' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({
        unauthorized: false,
        forbidden: false,
        notFound: false,
        conflict: false,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of products' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_query_dto_1.ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('search'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, swagger_1.ApiOperation)({ summary: 'Search products with complex filters (POST)' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({
        unauthorized: false,
        forbidden: false,
        notFound: false,
        conflict: false,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_search_dto_1.ProductSearchDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get product by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product details',
        type: product_response_dto_1.ProductResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    openapi.ApiResponse({ status: 200, type: require("./dto/product-response.dto").ProductResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('incrementViews')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new sanitize_pipe_1.SanitizePipe()),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update product' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product updated',
        type: product_response_dto_1.ProductResponseDto,
    }),
    openapi.ApiResponse({ status: 200, type: require("./dto/product-response.dto").ProductResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete product' }),
    (0, api_error_responses_decorator_1.ApiCommonErrorResponses)({ conflict: false }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Product deleted' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "remove", null);
exports.ProductController = ProductController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map