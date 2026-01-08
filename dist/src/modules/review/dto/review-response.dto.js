"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewResponseDto = void 0;
const openapi = require("@nestjs/swagger");
class ReviewResponseDto {
    id;
    reviewerId;
    revieweeId;
    productId;
    orderId;
    parentId;
    rating;
    comment;
    isVerified;
    isReported;
    reportReason;
    reportedAt;
    helpfulCount;
    createdAt;
    updatedAt;
    reviewer;
    reviewee;
    product;
    replies;
    parent;
    static fromEntity(review) {
        return {
            id: review.id,
            reviewerId: review.reviewerId,
            revieweeId: review.revieweeId,
            productId: review.productId,
            orderId: review.orderId,
            parentId: review.parentId,
            rating: review.rating,
            comment: review.comment,
            isVerified: review.isVerified,
            isReported: review.isReported,
            reportReason: review.reportReason,
            reportedAt: review.reportedAt,
            helpfulCount: review.helpfulCount,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            reviewer: review.reviewer
                ? {
                    id: review.reviewer.id,
                    firstName: review.reviewer.firstName,
                    lastName: review.reviewer.lastName,
                    phoneNumber: review.reviewer.phoneNumber,
                    avatarId: review.reviewer.avatarId,
                }
                : undefined,
            reviewee: review.reviewee
                ? {
                    id: review.reviewee.id,
                    firstName: review.reviewee.firstName,
                    lastName: review.reviewee.lastName,
                    phoneNumber: review.reviewee.phoneNumber,
                }
                : undefined,
            product: review.product
                ? {
                    id: review.product.id,
                    title: review.product.title,
                    slug: review.product.slug,
                }
                : null,
            replies: review.replies?.map((reply) => ReviewResponseDto.fromEntity(reply)),
            parent: review.parent
                ? {
                    id: review.parent.id,
                    rating: review.parent.rating,
                    comment: review.parent.comment,
                }
                : null,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, reviewerId: { required: true, type: () => String }, revieweeId: { required: true, type: () => String }, productId: { required: true, type: () => String, nullable: true }, orderId: { required: true, type: () => String, nullable: true }, parentId: { required: true, type: () => String, nullable: true }, rating: { required: true, type: () => Number }, comment: { required: true, type: () => String, nullable: true }, isVerified: { required: true, type: () => Boolean }, isReported: { required: true, type: () => Boolean }, reportReason: { required: true, type: () => String, nullable: true }, reportedAt: { required: true, type: () => Date, nullable: true }, helpfulCount: { required: true, type: () => Number }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, reviewer: { required: false, type: () => ({ id: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String }, avatarId: { required: true, type: () => String, nullable: true } }) }, reviewee: { required: false, type: () => ({ id: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String } }) }, product: { required: false, type: () => ({ id: { required: true, type: () => String }, title: { required: true, type: () => String }, slug: { required: true, type: () => String } }), nullable: true }, replies: { required: false, type: () => [require("./review-response.dto").ReviewResponseDto] }, parent: { required: false, type: () => ({ id: { required: true, type: () => String }, rating: { required: true, type: () => Number }, comment: { required: true, type: () => String, nullable: true } }), nullable: true } };
    }
}
exports.ReviewResponseDto = ReviewResponseDto;
//# sourceMappingURL=review-response.dto.js.map