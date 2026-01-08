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
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const nest_winston_1 = require("nest-winston");
let LoggingInterceptor = class LoggingInterceptor {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        const now = Date.now();
        this.logger.log(`Incoming request - ${method} ${url}`, 'LoggingInterceptor');
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const responseTime = Date.now() - now;
                const isSlow = responseTime > 1000;
                if (isSlow) {
                    this.logger.warn(`Slow endpoint - ${method} ${url} took ${responseTime}ms`, 'LoggingInterceptor');
                }
                else {
                    this.logger.log(`Request completed - ${method} ${url} in ${responseTime}ms`, 'LoggingInterceptor');
                }
            },
            error: (error) => {
                const requestId = request.id;
                const userId = request.user
                    ?.id;
                const meta = {
                    context: 'LoggingInterceptor',
                    stack: error.stack,
                    requestId,
                    userId,
                    method,
                    url,
                };
                const errorMessage = `Request failed - ${method} ${url}: ${error.message}`;
                this.logger.error(`${errorMessage} ${JSON.stringify(meta)}`);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nest_winston_1.WINSTON_MODULE_PROVIDER)),
    __metadata("design:paramtypes", [nest_winston_1.WinstonLogger])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map