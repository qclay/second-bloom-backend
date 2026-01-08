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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSearchDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class ProductSearchDto {
    search;
    categoryId;
    categoryIds;
    sellerId;
    sellerIds;
    isFeatured;
    type;
    types;
    status;
    statuses;
    region;
    regions;
    city;
    cities;
    district;
    minPrice;
    maxPrice;
    tags;
    page = 1;
    limit = 20;
    sortBy = 'createdAt';
    sortOrder = 'desc';
    static _OPENAPI_METADATA_FACTORY() {
        return { search: { required: false, type: () => String }, categoryId: { required: false, type: () => String }, categoryIds: { required: false, type: () => [String] }, sellerId: { required: false, type: () => String }, sellerIds: { required: false, type: () => [String] }, isFeatured: { required: false, type: () => Boolean }, type: { required: false, type: () => Object }, types: { required: false, type: () => [Object] }, status: { required: false, type: () => Object }, statuses: { required: false, type: () => [Object] }, region: { required: false, type: () => String }, regions: { required: false, type: () => [String] }, city: { required: false, type: () => String }, cities: { required: false, type: () => [String] }, district: { required: false, type: () => String }, minPrice: { required: false, type: () => Number, minimum: 0 }, maxPrice: { required: false, type: () => Number, minimum: 0 }, tags: { required: false, type: () => [String] }, page: { required: false, type: () => Number, default: 1, minimum: 1 }, limit: { required: false, type: () => Number, default: 20, minimum: 1 }, sortBy: { required: false, type: () => String, default: "createdAt" }, sortOrder: { required: false, type: () => Object, default: "desc" } };
    }
}
exports.ProductSearchDto = ProductSearchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Search term to find in title, slug, description, or tags',
        example: 'roses',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by category ID',
        example: 'category-id',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by multiple category IDs',
        example: ['category-id-1', 'category-id-2'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProductSearchDto.prototype, "categoryIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by seller ID',
        example: 'seller-id',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "sellerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by multiple seller IDs',
        example: ['seller-id-1', 'seller-id-2'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProductSearchDto.prototype, "sellerIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter featured products',
        example: true,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductSearchDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by product type',
        enum: client_1.ProductType,
        example: 'FRESH',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProductType),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by multiple product types',
        enum: client_1.ProductType,
        isArray: true,
        example: ['FRESH', 'DRIED'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.ProductType, { each: true }),
    __metadata("design:type", Array)
], ProductSearchDto.prototype, "types", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by product status',
        enum: client_1.ProductStatus,
        example: 'ACTIVE',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProductStatus),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by multiple product statuses',
        enum: client_1.ProductStatus,
        isArray: true,
        example: ['ACTIVE', 'DRAFT'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(client_1.ProductStatus, { each: true }),
    __metadata("design:type", Array)
], ProductSearchDto.prototype, "statuses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by region',
        example: 'Tashkent',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by multiple regions',
        example: ['Tashkent', 'Samarkand'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProductSearchDto.prototype, "regions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by city',
        example: 'Tashkent',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by multiple cities',
        example: ['Tashkent', 'Samarkand'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProductSearchDto.prototype, "cities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by district',
        example: 'Yunusabad',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum price filter',
        example: 100000,
        minimum: 0,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductSearchDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum price filter',
        example: 500000,
        minimum: 0,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductSearchDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by tags (products must have at least one of these tags)',
        example: ['roses', 'bouquet'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ProductSearchDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number (1-indexed)',
        example: 1,
        minimum: 1,
        default: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProductSearchDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 20,
        minimum: 1,
        maximum: 100,
        default: 20,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProductSearchDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field to sort by',
        example: 'price',
        enum: ['price', 'views', 'createdAt', 'updatedAt'],
        default: 'createdAt',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc'],
        default: 'desc',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSearchDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=product-search.dto.js.map