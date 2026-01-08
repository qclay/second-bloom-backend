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
exports.OrderResponseDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const product_nested_dto_1 = require("../../product/dto/product-nested.dto");
class OrderResponseDto {
    id;
    orderNumber;
    buyerId;
    productId;
    auctionId;
    amount;
    status;
    paymentStatus;
    shippingAddress;
    notes;
    cancelledAt;
    cancelledBy;
    cancellationReason;
    shippedAt;
    deliveredAt;
    deletedAt;
    deletedBy;
    createdAt;
    updatedAt;
    completedAt;
    buyer;
    product;
    auction;
    seller;
    static fromEntity(order) {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            buyerId: order.buyerId,
            productId: order.productId,
            auctionId: order.auctionId,
            amount: Number(order.amount),
            status: order.status,
            paymentStatus: order.paymentStatus,
            shippingAddress: order.shippingAddress,
            notes: order.notes,
            cancelledAt: order.cancelledAt,
            cancelledBy: order.cancelledBy,
            cancellationReason: order.cancellationReason,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            deletedAt: order.deletedAt,
            deletedBy: order.deletedBy,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            completedAt: order.completedAt,
            buyer: order.buyer
                ? {
                    id: order.buyer.id,
                    firstName: order.buyer.firstName,
                    lastName: order.buyer.lastName,
                    phoneNumber: order.buyer.phoneNumber,
                }
                : undefined,
            product: order.product
                ? {
                    id: order.product.id,
                    title: order.product.title,
                    slug: order.product.slug,
                    price: typeof order.product.price === 'number'
                        ? order.product.price
                        : Number(order.product.price) || 0,
                    sellerId: order.product.sellerId,
                    images: order.product.images?.map((img) => ({
                        url: img.file?.url,
                    })),
                }
                : undefined,
            auction: order.auction
                ? {
                    id: order.auction.id,
                    productId: order.auction.productId,
                    status: order.auction.status,
                }
                : null,
            seller: order.seller
                ? {
                    id: order.seller.id,
                    firstName: order.seller.firstName,
                    lastName: order.seller.lastName,
                    phoneNumber: order.seller.phoneNumber,
                }
                : undefined,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, orderNumber: { required: true, type: () => String }, buyerId: { required: true, type: () => String }, productId: { required: true, type: () => String }, auctionId: { required: true, type: () => String, nullable: true }, amount: { required: true, type: () => Number }, status: { required: true, type: () => String }, paymentStatus: { required: true, type: () => String }, shippingAddress: { required: true, type: () => String, nullable: true }, notes: { required: true, type: () => String, nullable: true }, cancelledAt: { required: true, type: () => Date, nullable: true }, cancelledBy: { required: true, type: () => String, nullable: true }, cancellationReason: { required: true, type: () => String, nullable: true }, shippedAt: { required: true, type: () => Date, nullable: true }, deliveredAt: { required: true, type: () => Date, nullable: true }, deletedAt: { required: true, type: () => Date, nullable: true }, deletedBy: { required: true, type: () => String, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, completedAt: { required: true, type: () => Date, nullable: true }, buyer: { required: false, type: () => ({ id: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String } }) }, product: { required: false, type: () => Object }, auction: { required: false, type: () => ({ id: { required: true, type: () => String }, productId: { required: true, type: () => String }, status: { required: true, type: () => String } }), nullable: true }, seller: { required: false, type: () => ({ id: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String } }) } };
    }
}
exports.OrderResponseDto = OrderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "orderNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "auctionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "shippingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "cancelledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "cancelledBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "cancellationReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "shippedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "deliveredAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "deletedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "deletedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "buyer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => product_nested_dto_1.ProductNestedDto, required: false }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "product", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "auction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "seller", void 0);
//# sourceMappingURL=order-response.dto.js.map