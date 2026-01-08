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
exports.CategoryResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const file_response_dto_1 = require("../../file/dto/file-response.dto");
const swagger_1 = require("@nestjs/swagger");
class CategoryResponseDto {
    id;
    name;
    slug;
    description;
    image;
    parentId;
    order;
    isActive;
    createdAt;
    updatedAt;
    deletedAt;
    children;
    static fromEntity(category) {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image ? file_response_dto_1.FileResponseDto.fromEntity(category.image) : null,
            parentId: category.parentId,
            order: category.order,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            deletedAt: category.deletedAt,
            children: category.children
                ? category.children.map((child) => CategoryResponseDto.fromEntity(child))
                : undefined,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, description: { required: true, type: () => String, nullable: true }, image: { required: true, type: () => require("../../file/dto/file-response.dto").FileResponseDto, nullable: true }, parentId: { required: true, type: () => String, nullable: true }, order: { required: true, type: () => Number }, isActive: { required: true, type: () => Boolean }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, deletedAt: { required: true, type: () => Date, nullable: true }, children: { required: false, type: () => [require("./category-response.dto").CategoryResponseDto] } };
    }
}
exports.CategoryResponseDto = CategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cm5h1234567890' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Flowers' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'flowers' }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Fresh and beautiful flowers', nullable: true }),
    __metadata("design:type", Object)
], CategoryResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => file_response_dto_1.FileResponseDto, nullable: true }),
    __metadata("design:type", Object)
], CategoryResponseDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: null, nullable: true }),
    __metadata("design:type", Object)
], CategoryResponseDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], CategoryResponseDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], CategoryResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CategoryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], CategoryResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], CategoryResponseDto.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => [CategoryResponseDto], required: false }),
    __metadata("design:type", Array)
], CategoryResponseDto.prototype, "children", void 0);
//# sourceMappingURL=category-response.dto.js.map