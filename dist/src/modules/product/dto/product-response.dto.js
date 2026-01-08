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
exports.ProductResponseDto = exports.ProductImageResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class ProductImageResponseDto {
    id;
    fileId;
    order;
    createdAt;
    url;
    static fromEntity(image) {
        return {
            id: image.id,
            fileId: image.fileId,
            order: image.order,
            createdAt: image.createdAt,
            url: image.file?.url,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, fileId: { required: true, type: () => String }, order: { required: true, type: () => Number }, createdAt: { required: true, type: () => Date }, url: { required: false, type: () => String } };
    }
}
exports.ProductImageResponseDto = ProductImageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductImageResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductImageResponseDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ProductImageResponseDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProductImageResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ProductImageResponseDto.prototype, "url", void 0);
class ProductResponseDto {
    id;
    title;
    slug;
    description;
    price;
    currency;
    categoryId;
    tags;
    type;
    condition;
    quantity;
    status;
    isFeatured;
    views;
    region;
    city;
    district;
    sellerId;
    createdAt;
    updatedAt;
    deletedAt;
    category;
    seller;
    images;
    static fromEntity(product) {
        return {
            id: product.id,
            title: product.title,
            slug: product.slug,
            description: product.description,
            price: Number(product.price),
            currency: product.currency,
            categoryId: product.categoryId,
            tags: product.tags,
            type: product.type,
            condition: product.condition,
            quantity: product.quantity,
            status: product.status,
            isFeatured: product.isFeatured,
            views: product.views,
            region: product.region,
            city: product.city,
            district: product.district,
            sellerId: product.sellerId,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            deletedAt: product.deletedAt,
            category: product.category
                ? {
                    id: product.category.id,
                    name: product.category.name,
                    slug: product.category.slug,
                }
                : undefined,
            seller: product.seller
                ? {
                    id: product.seller.id,
                    firstName: product.seller.firstName,
                    lastName: product.seller.lastName,
                    phoneNumber: product.seller.phoneNumber,
                }
                : undefined,
            images: product.images
                ? product.images.map((img) => ProductImageResponseDto.fromEntity(img))
                : undefined,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, title: { required: true, type: () => String }, slug: { required: true, type: () => String }, description: { required: true, type: () => String, nullable: true }, price: { required: true, type: () => Number }, currency: { required: true, type: () => String }, categoryId: { required: true, type: () => String }, tags: { required: true, type: () => [String] }, type: { required: true, type: () => String }, condition: { required: true, type: () => String, nullable: true }, quantity: { required: true, type: () => Number }, status: { required: true, type: () => String }, isFeatured: { required: true, type: () => Boolean }, views: { required: true, type: () => Number }, region: { required: true, type: () => String, nullable: true }, city: { required: true, type: () => String, nullable: true }, district: { required: true, type: () => String, nullable: true }, sellerId: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, deletedAt: { required: true, type: () => Date, nullable: true }, category: { required: false, type: () => ({ id: { required: true, type: () => String }, name: { required: true, type: () => String }, slug: { required: true, type: () => String } }) }, seller: { required: false, type: () => ({ id: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String } }) }, images: { required: false, type: () => [require("./product-response.dto").ProductImageResponseDto] } };
    }
}
exports.ProductResponseDto = ProductResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], ProductResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ProductResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], ProductResponseDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], ProductResponseDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ProductResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ProductResponseDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ProductResponseDto.prototype, "views", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], ProductResponseDto.prototype, "region", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], ProductResponseDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], ProductResponseDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProductResponseDto.prototype, "sellerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProductResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProductResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], ProductResponseDto.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], ProductResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], ProductResponseDto.prototype, "seller", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => [ProductImageResponseDto], required: false }),
    __metadata("design:type", Array)
], ProductResponseDto.prototype, "images", void 0);
//# sourceMappingURL=product-response.dto.js.map