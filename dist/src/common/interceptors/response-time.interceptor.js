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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTimeInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const nest_winston_1 = require("nest-winston");
const metrics_service_1 = require("../../metrics/metrics.service");
let ResponseTimeInterceptor = class ResponseTimeInterceptor {
    logger;
    metricsService;
    constructor(logger, metricsService) {
        this.logger = logger;
        this.metricsService = metricsService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();
        const method = request.method;
        const route = request.route?.path || request.url.split('?')[0];
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const responseTime = Date.now() - startTime;
                const statusCode = response.statusCode;
                response.setHeader('X-Response-Time', `${responseTime}ms`);
                if (this.metricsService) {
                    this.metricsService.recordHttpRequest(method, route, statusCode, responseTime);
                }
                if (responseTime > 1000) {
                    const meta = {
                        requestId: request.id,
                        method,
                        url: request.url,
                        responseTime,
                    };
                    this.logger.warn(`Slow response detected: ${method} ${request.url} - ${responseTime}ms ${JSON.stringify(meta)}`);
                }
            },
            error: (error) => {
                const responseTime = Date.now() - startTime;
                const statusCode = error.status || 500;
                response.setHeader('X-Response-Time', `${responseTime}ms`);
                if (this.metricsService) {
                    this.metricsService.recordHttpRequest(method, route, statusCode, responseTime);
                }
            },
        }));
    }
};
exports.ResponseTimeInterceptor = ResponseTimeInterceptor;
exports.ResponseTimeInterceptor = ResponseTimeInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, common_1.Inject)(metrics_service_1.MetricsService)),
    __metadata("design:paramtypes", [nest_winston_1.WinstonLogger,
        metrics_service_1.MetricsService])
], ResponseTimeInterceptor);
//# sourceMappingURL=response-time.interceptor.js.map