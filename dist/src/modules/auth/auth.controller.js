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
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const send_otp_dto_1 = require("./dto/send-otp.dto");
const verify_otp_dto_1 = require("./dto/verify-otp.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
const api_error_responses_decorator_1 = require("../../common/decorators/api-error-responses.decorator");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async sendOtp(sendOtpDto) {
        return this.authService.sendOtp(sendOtpDto);
    }
    async verify(verifyOtpDto) {
        return this.authService.verifyOtp(verifyOtpDto);
    }
    async refresh(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
    async logout(user) {
        return this.authService.logout(user.id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('otp'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Send OTP to phone number',
        description: 'Sends a one-time password (OTP) to the provided phone number. Works for both new and existing users. OTP expires in 5 minutes.',
    }),
    (0, swagger_1.ApiBody)({ type: send_otp_dto_1.SendOtpDto }),
    (0, api_error_responses_decorator_1.ApiPublicErrorResponses)(),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP sent successfully to phone via SMS and Telegram',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Verification code sent successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid phone number format',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many requests. Please wait before requesting a new code.',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_otp_dto_1.SendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify OTP and authenticate',
        description: 'Verifies the OTP code and authenticates the user. Automatically creates a new account for first-time users or logs in existing users. Returns JWT access and refresh tokens.',
    }),
    (0, swagger_1.ApiBody)({ type: verify_otp_dto_1.VerifyOtpDto }),
    (0, api_error_responses_decorator_1.ApiPublicErrorResponses)(),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP verified successfully. User authenticated with tokens.',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid OTP format',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or expired OTP code',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Maximum verification attempts exceeded',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("./dto/auth-response.dto").AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh access token',
        description: 'Generates a new access token and refresh token pair using a valid refresh token. The old refresh token will be invalidated.',
    }),
    (0, swagger_1.ApiBody)({ type: refresh_token_dto_1.RefreshTokenDto }),
    (0, api_error_responses_decorator_1.ApiPublicErrorResponses)(),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access token refreshed successfully with new token pair',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid or expired refresh token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Refresh token has been revoked',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: require("./dto/auth-response.dto").AuthResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Logout user',
        description: 'Invalidates all refresh tokens for the current user and logs them out from all devices. The current access token will remain valid until it expires.',
    }),
    (0, api_error_responses_decorator_1.ApiAuthErrorResponses)(),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User logged out successfully from all devices',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Logged out successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Not authenticated or token expired',
    }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('Auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map