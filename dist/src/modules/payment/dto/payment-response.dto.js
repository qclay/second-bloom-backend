"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentResponseDto = void 0;
const openapi = require("@nestjs/swagger");
class PaymentResponseDto {
    id;
    userId;
    paymentType;
    amount;
    quantity;
    method;
    gateway;
    transactionId;
    gatewayTransactionId;
    gatewayOrderId;
    status;
    paidAt;
    createdAt;
    updatedAt;
    static fromEntity(payment) {
        return {
            id: payment.id,
            userId: payment.userId,
            paymentType: payment.paymentType,
            amount: Number(payment.amount),
            quantity: payment.quantity,
            method: payment.method,
            gateway: payment.gateway,
            transactionId: payment.transactionId,
            gatewayTransactionId: payment.gatewayTransactionId,
            gatewayOrderId: payment.gatewayOrderId,
            status: payment.status,
            paidAt: payment.paidAt,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, userId: { required: true, type: () => String }, paymentType: { required: true, type: () => String }, amount: { required: true, type: () => Number }, quantity: { required: true, type: () => Number }, method: { required: true, type: () => String }, gateway: { required: true, type: () => String, nullable: true }, transactionId: { required: true, type: () => String, nullable: true }, gatewayTransactionId: { required: true, type: () => String, nullable: true }, gatewayOrderId: { required: true, type: () => String, nullable: true }, status: { required: true, type: () => String }, paidAt: { required: true, type: () => Date, nullable: true }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
}
exports.PaymentResponseDto = PaymentResponseDto;
//# sourceMappingURL=payment-response.dto.js.map