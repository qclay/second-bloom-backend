"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const request_id_interceptor_1 = require("./interceptors/request-id.interceptor");
const response_interceptor_1 = require("./interceptors/response.interceptor");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
const response_time_interceptor_1 = require("./interceptors/response-time.interceptor");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const validation_exception_filter_1 = require("./filters/validation-exception.filter");
const all_exceptions_filter_1 = require("./filters/all-exceptions.filter");
const sentry_service_1 = require("./services/sentry.service");
const redis_module_1 = require("../redis/redis.module");
const logger_module_1 = require("./logger/logger.module");
const metrics_module_1 = require("../metrics/metrics.module");
const config_module_1 = require("../config/config.module");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [redis_module_1.RedisModule, logger_module_1.LoggerModule, metrics_module_1.MetricsModule, config_module_1.ConfigModule],
        providers: [
            sentry_service_1.SentryService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: request_id_interceptor_1.RequestIdInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_interceptor_1.ResponseInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_time_interceptor_1.ResponseTimeInterceptor,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: validation_exception_filter_1.ValidationExceptionFilter,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
        ],
        exports: [sentry_service_1.SentryService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map