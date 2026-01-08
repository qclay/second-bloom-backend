"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const config_module_1 = require("./config/config.module");
const common_module_1 = require("./common/common.module");
const redis_module_1 = require("./redis/redis.module");
const health_module_1 = require("./health/health.module");
const infrastructure_module_1 = require("./infrastructure/infrastructure.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const file_module_1 = require("./modules/file/file.module");
const category_module_1 = require("./modules/category/category.module");
const product_module_1 = require("./modules/product/product.module");
const auction_module_1 = require("./modules/auction/auction.module");
const bid_module_1 = require("./modules/bid/bid.module");
const order_module_1 = require("./modules/order/order.module");
const review_module_1 = require("./modules/review/review.module");
const notification_module_1 = require("./modules/notification/notification.module");
const chat_module_1 = require("./modules/chat/chat.module");
const seller_module_1 = require("./modules/seller/seller.module");
const jobs_module_1 = require("./jobs/jobs.module");
const metrics_module_1 = require("./metrics/metrics.module");
const throttler_per_user_guard_1 = require("./common/guards/throttler-per-user.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            redis_module_1.RedisModule,
            infrastructure_module_1.InfrastructureModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 10,
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 50,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            file_module_1.FileModule,
            category_module_1.CategoryModule,
            product_module_1.ProductModule,
            auction_module_1.AuctionModule,
            bid_module_1.BidModule,
            order_module_1.OrderModule,
            review_module_1.ReviewModule,
            notification_module_1.NotificationModule,
            chat_module_1.ChatModule,
            seller_module_1.SellerModule,
            jobs_module_1.JobsModule,
            metrics_module_1.MetricsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_per_user_guard_1.ThrottlerPerUserGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map