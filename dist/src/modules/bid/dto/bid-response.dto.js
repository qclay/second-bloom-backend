"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BidResponseDto = void 0;
const openapi = require("@nestjs/swagger");
class BidResponseDto {
    id;
    auctionId;
    bidderId;
    amount;
    isWinning;
    isRetracted;
    ipAddress;
    userAgent;
    createdAt;
    updatedAt;
    auction;
    bidder;
    static fromEntity(bid) {
        return {
            id: bid.id,
            auctionId: bid.auctionId,
            bidderId: bid.bidderId,
            amount: Number(bid.amount),
            isWinning: bid.isWinning,
            isRetracted: bid.isRetracted,
            ipAddress: bid.ipAddress,
            userAgent: bid.userAgent,
            createdAt: bid.createdAt,
            updatedAt: bid.updatedAt,
            auction: bid.auction
                ? {
                    id: bid.auction.id,
                    productId: bid.auction.productId,
                    currentPrice: typeof bid.auction.currentPrice === 'number'
                        ? bid.auction.currentPrice
                        : Number(bid.auction.currentPrice) || 0,
                    status: bid.auction.status,
                    endTime: bid.auction.endTime,
                    product: bid.auction.product,
                }
                : undefined,
            bidder: bid.bidder
                ? {
                    id: bid.bidder.id,
                    firstName: bid.bidder.firstName,
                    lastName: bid.bidder.lastName,
                    phoneNumber: bid.bidder.phoneNumber,
                }
                : undefined,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, auctionId: { required: true, type: () => String }, bidderId: { required: true, type: () => String }, amount: { required: true, type: () => Number }, isWinning: { required: true, type: () => Boolean }, isRetracted: { required: true, type: () => Boolean }, ipAddress: { required: true, type: () => String, nullable: true }, userAgent: { required: true, type: () => String, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, auction: { required: false, type: () => ({ id: { required: true, type: () => String }, productId: { required: true, type: () => String }, currentPrice: { required: true, type: () => Number }, status: { required: true, type: () => String }, endTime: { required: true, type: () => Date }, product: { required: false, type: () => ({ id: { required: true, type: () => String }, title: { required: true, type: () => String }, slug: { required: true, type: () => String } }) } }) }, bidder: { required: false, type: () => ({ id: { required: true, type: () => String }, firstName: { required: true, type: () => String, nullable: true }, lastName: { required: true, type: () => String, nullable: true }, phoneNumber: { required: true, type: () => String } }) } };
    }
}
exports.BidResponseDto = BidResponseDto;
//# sourceMappingURL=bid-response.dto.js.map