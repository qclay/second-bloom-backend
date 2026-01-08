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
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = __importStar(require("firebase-admin"));
const retry_util_1 = require("../../common/utils/retry.util");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    configService;
    logger = new common_1.Logger(FirebaseService_1.name);
    app = null;
    circuitBreaker;
    constructor(configService) {
        this.configService = configService;
        this.circuitBreaker = new retry_util_1.CircuitBreaker(5, 60000, this.logger);
    }
    onModuleInit() {
        try {
            const firebaseConfig = this.configService.get('firebase');
            const projectId = firebaseConfig?.projectId;
            const privateKey = firebaseConfig?.privateKey;
            const clientEmail = firebaseConfig?.clientEmail;
            if (!projectId || !privateKey || !clientEmail) {
                this.logger.warn('Firebase credentials not configured. Push notifications will be disabled.');
                return;
            }
            if (admin.apps.length === 0) {
                this.app = admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        privateKey,
                        clientEmail,
                    }),
                });
                this.logger.log('Firebase Admin SDK initialized successfully');
            }
            else {
                this.app = admin.app();
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK', error instanceof Error ? error.stack : error);
        }
    }
    async sendNotification(token, title, body, data) {
        if (!this.app) {
            this.logger.warn('Firebase not initialized. Notification not sent.');
            return false;
        }
        try {
            return await this.circuitBreaker.execute(async () => {
                return (0, retry_util_1.retry)(async () => {
                    const message = {
                        token,
                        notification: {
                            title,
                            body,
                        },
                        data: data
                            ? Object.fromEntries(Object.entries(data).map(([key, value]) => [
                                key,
                                String(value),
                            ]))
                            : undefined,
                        android: {
                            priority: 'high',
                        },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'default',
                                    badge: 1,
                                },
                            },
                        },
                    };
                    const response = await admin.messaging().send(message);
                    this.logger.log(`FCM notification sent successfully: ${response}`);
                    return true;
                }, {
                    maxAttempts: 2,
                    delay: 500,
                    backoff: 'exponential',
                    onRetry: (error, attempt) => {
                        this.logger.warn(`Retrying FCM notification send (attempt ${attempt}/2)`, error.message);
                    },
                });
            });
        }
        catch (error) {
            this.logger.error(`Failed to send FCM notification to token ${token.substring(0, 10)}...`, error instanceof Error ? error.message : 'Unknown error');
            if (error && typeof error === 'object' && 'code' in error) {
                const firebaseError = error;
                if (firebaseError.code === 'messaging/invalid-registration-token' ||
                    firebaseError.code === 'messaging/registration-token-not-registered') {
                    this.logger.warn(`Invalid or unregistered FCM token: ${token.substring(0, 10)}...`);
                    const invalidTokenError = new Error('INVALID_TOKEN');
                    invalidTokenError.name = 'InvalidTokenError';
                    throw invalidTokenError;
                }
            }
            if (error instanceof Error && error.name === 'InvalidTokenError') {
                throw error;
            }
            return false;
        }
    }
    async sendNotificationToMultiple(tokens, title, body, data) {
        if (!this.app) {
            this.logger.warn('Firebase not initialized. Notifications not sent.');
            return { success: 0, failure: tokens.length };
        }
        if (tokens.length === 0) {
            return { success: 0, failure: 0 };
        }
        try {
            const message = {
                tokens,
                notification: {
                    title,
                    body,
                },
                data: data
                    ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]))
                    : undefined,
                android: {
                    priority: 'high',
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await admin.messaging().sendEachForMulticast(message);
            this.logger.log(`FCM multicast sent: ${response.successCount} success, ${response.failureCount} failure`);
            if (response.failureCount > 0) {
                const invalidTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errorCode = resp.error?.code;
                        if (errorCode === 'messaging/invalid-registration-token' ||
                            errorCode === 'messaging/registration-token-not-registered') {
                            invalidTokens.push(tokens[idx]);
                        }
                        this.logger.warn(`Failed to send to token ${tokens[idx].substring(0, 10)}...: ${resp.error?.message}`);
                    }
                });
                if (invalidTokens.length > 0) {
                    this.logger.warn(`Found ${invalidTokens.length} invalid FCM tokens in multicast. They should be removed from database.`);
                }
            }
            return {
                success: response.successCount,
                failure: response.failureCount,
            };
        }
        catch (error) {
            this.logger.error('Failed to send FCM multicast notification', error instanceof Error ? error.message : 'Unknown error');
            return { success: 0, failure: tokens.length };
        }
    }
    validateToken(token) {
        if (!this.app) {
            return false;
        }
        if (!token || typeof token !== 'string') {
            return false;
        }
        const trimmedToken = token.trim();
        if (trimmedToken.length < 10 || trimmedToken.length > 2000) {
            return false;
        }
        return true;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map