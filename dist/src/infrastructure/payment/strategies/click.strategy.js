"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClickStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const retry_util_1 = require("../../../common/utils/retry.util");
let ClickStrategy = ClickStrategy_1 = class ClickStrategy {
    configService;
    logger = new common_1.Logger(ClickStrategy_1.name);
    merchantId;
    serviceId;
    secretKey;
    baseUrl;
    circuitBreaker;
    constructor(configService) {
        this.configService = configService;
        const paymentConfig = this.configService.get('payment');
        this.merchantId = paymentConfig?.click?.merchantId || '';
        this.serviceId = paymentConfig?.click?.serviceId || '';
        this.secretKey = paymentConfig?.click?.secretKey || '';
        this.baseUrl =
            paymentConfig?.click?.baseUrl || 'https://api.click.uz/v2/merchant';
        this.circuitBreaker = new retry_util_1.CircuitBreaker(5, 60000, this.logger);
    }
    generateSign(data) {
        const sortedKeys = Object.keys(data).sort();
        const signString = sortedKeys
            .map((key) => {
            const value = data[key];
            const stringValue = value === null || value === undefined
                ? ''
                : typeof value === 'string'
                    ? value
                    : typeof value === 'number'
                        ? value.toString()
                        : JSON.stringify(value);
            return `${key}=${stringValue}`;
        })
            .join('&');
        return crypto
            .createHash('md5')
            .update(signString + this.secretKey)
            .digest('hex');
    }
    async initiatePayment(amount, orderId, transactionId) {
        return this.circuitBreaker
            .execute(async () => {
            return (0, retry_util_1.retry)(async () => {
                const amountInTiyin = Math.round(amount * 100);
                const timestamp = Date.now().toString();
                const data = {
                    merchant_id: this.merchantId,
                    service_id: this.serviceId,
                    amount: amountInTiyin,
                    transaction_param: orderId,
                    merchant_trans_id: transactionId,
                };
                const sign = this.generateSign(data);
                const requestData = {
                    ...data,
                    sign_time: timestamp,
                    sign_string: sign,
                };
                const response = await fetch(`${this.baseUrl}/invoice/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });
                if (!response.ok) {
                    const error = await response.json();
                    this.logger.error(`Click payment initiation failed: ${JSON.stringify(error)}`);
                    throw new Error(`Click payment initiation failed: ${error.error_note || 'Unknown error'}`);
                }
                const result = await response.json();
                if (result.error_code !== 0) {
                    this.logger.error(`Click error: ${JSON.stringify(result)}`);
                    throw new Error(`Click error: ${result.error_note || 'Unknown error'}`);
                }
                const paymentUrl = result.invoice_url;
                this.logger.log(`Click payment initiated: ${transactionId}, Gateway transaction: ${result.click_trans_id}`);
                return {
                    transactionId,
                    paymentUrl,
                    redirectUrl: paymentUrl,
                    gatewayTransactionId: result.click_trans_id?.toString(),
                    gatewayOrderId: orderId,
                };
            }, {
                maxAttempts: 3,
                delay: 1000,
                backoff: 'exponential',
                onRetry: (error, attempt) => {
                    this.logger.warn(`Retrying Click payment initiation (attempt ${attempt}/3) for transaction: ${transactionId}`, error.message);
                },
            });
        })
            .catch((error) => {
            this.logger.error(`Error initiating Click payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        });
    }
    async verifyPayment(gatewayTransactionId, transactionId) {
        try {
            return await this.circuitBreaker.execute(async () => {
                return (0, retry_util_1.retry)(async () => {
                    const data = {
                        merchant_id: this.merchantId,
                        service_id: this.serviceId,
                        click_trans_id: gatewayTransactionId,
                        merchant_trans_id: transactionId,
                    };
                    const sign = this.generateSign(data);
                    const requestData = {
                        ...data,
                        sign_string: sign,
                    };
                    const response = await fetch(`${this.baseUrl}/payment/status`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify(requestData),
                    });
                    if (!response.ok) {
                        this.logger.warn(`Click verification failed for transaction ${transactionId}`);
                        return {
                            success: false,
                            status: 'FAILED',
                            gatewayTransactionId,
                        };
                    }
                    const result = await response.json();
                    if (result.error_code !== 0) {
                        this.logger.warn(`Click verification error for transaction ${transactionId}: ${JSON.stringify(result)}`);
                        return {
                            success: false,
                            status: 'FAILED',
                            gatewayTransactionId,
                        };
                    }
                    if (result.payment_status === 2) {
                        return {
                            success: true,
                            status: 'COMPLETED',
                            gatewayTransactionId,
                        };
                    }
                    if (result.payment_status === -1 || result.payment_status === -99) {
                        return {
                            success: false,
                            status: 'FAILED',
                            gatewayTransactionId,
                        };
                    }
                    return {
                        success: false,
                        status: 'PENDING',
                        gatewayTransactionId,
                    };
                }, {
                    maxAttempts: 2,
                    delay: 1000,
                    backoff: 'exponential',
                    onRetry: (error, attempt) => {
                        this.logger.warn(`Retrying Click verification (attempt ${attempt}/2) for transaction: ${transactionId}`, error.message);
                    },
                });
            });
        }
        catch (error) {
            this.logger.error(`Error verifying Click payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                status: 'FAILED',
                gatewayTransactionId,
            };
        }
    }
    async refundPayment(gatewayTransactionId, amount, transactionId) {
        try {
            return await this.circuitBreaker.execute(async () => {
                return (0, retry_util_1.retry)(async () => {
                    const amountInTiyin = Math.round(amount * 100);
                    const refundTransactionId = Date.now().toString();
                    const data = {
                        merchant_id: this.merchantId,
                        service_id: this.serviceId,
                        click_trans_id: gatewayTransactionId,
                        merchant_trans_id: transactionId,
                        amount: amountInTiyin,
                        merchant_prepare_id: refundTransactionId,
                    };
                    const sign = this.generateSign(data);
                    const requestData = {
                        ...data,
                        sign_string: sign,
                    };
                    const response = await fetch(`${this.baseUrl}/payment/reversal`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify(requestData),
                    });
                    if (!response.ok) {
                        const error = await response.json();
                        this.logger.error(`Click refund failed for transaction ${transactionId}: ${JSON.stringify(error)}`);
                        throw new Error(`Click refund failed: ${error.error_note || 'Unknown error'}`);
                    }
                    const result = await response.json();
                    if (result.error_code !== 0) {
                        this.logger.error(`Click refund error: ${JSON.stringify(result)}`);
                        throw new Error(`Click refund error: ${result.error_note || 'Unknown error'}`);
                    }
                    this.logger.log(`Click refund successful for transaction ${transactionId}`);
                    return {
                        success: true,
                        refundTransactionId,
                    };
                }, {
                    maxAttempts: 3,
                    delay: 1000,
                    backoff: 'exponential',
                    onRetry: (error, attempt) => {
                        this.logger.warn(`Retrying Click refund (attempt ${attempt}/3) for transaction: ${transactionId}`, error.message);
                    },
                });
            });
        }
        catch (error) {
            this.logger.error(`Error processing Click refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
            };
        }
    }
    verifyWebhook(payload, _headers) {
        try {
            const data = payload;
            if (!data.sign_string) {
                return false;
            }
            const signData = {
                click_trans_id: data.click_trans_id,
                service_id: this.serviceId,
                merchant_trans_id: data.merchant_trans_id,
            };
            const payloadData = payload;
            if (payloadData.amount !== undefined) {
                signData.amount = payloadData.amount;
            }
            if (payloadData.action !== undefined) {
                signData.action = payloadData.action;
            }
            if (payloadData.sign_time !== undefined) {
                signData.sign_time = payloadData.sign_time;
            }
            const expectedSign = this.generateSign(signData);
            return expectedSign === data.sign_string;
        }
        catch (error) {
            this.logger.error(`Error verifying Click webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
    processWebhook(payload) {
        try {
            const data = payload;
            const gatewayTransactionId = data.click_trans_id?.toString();
            const transactionId = data.merchant_trans_id;
            const amount = data.amount ? data.amount / 100 : undefined;
            const action = data.action;
            if (!gatewayTransactionId || !transactionId) {
                throw new Error('Missing required Click webhook parameters');
            }
            let status = 'PENDING';
            if (action === 0) {
                status = 'COMPLETED';
            }
            else if (action === -1 || data.error) {
                status = 'FAILED';
            }
            return Promise.resolve({
                transactionId,
                status,
                gatewayTransactionId,
                amount,
            });
        }
        catch (error) {
            this.logger.error(`Error processing Click webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
};
exports.ClickStrategy = ClickStrategy;
exports.ClickStrategy = ClickStrategy = ClickStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ClickStrategy);
//# sourceMappingURL=click.strategy.js.map