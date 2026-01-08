import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import {
  ApiPublicErrorResponses,
  ApiAuthErrorResponses,
} from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Authentication')
@Controller('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP to phone number',
    description:
      'Sends a one-time password (OTP) to the provided phone number. Works for both new and existing users. OTP expires in 5 minutes.',
  })
  @ApiBody({ type: SendOtpDto })
  @ApiPublicErrorResponses()
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid phone number format',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please wait before requesting a new code.',
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post('verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and authenticate',
    description:
      'Verifies the OTP code and authenticates the user. Automatically creates a new account for first-time users or logs in existing users. Returns JWT access and refresh tokens.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiPublicErrorResponses()
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully. User authenticated with tokens.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP format',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired OTP code',
  })
  @ApiResponse({
    status: 429,
    description: 'Maximum verification attempts exceeded',
  })
  async verify(@Body() verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token and refresh token pair using a valid refresh token. The old refresh token will be invalidated.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiPublicErrorResponses()
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully with new token pair',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 403,
    description: 'Refresh token has been revoked',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Invalidates all refresh tokens for the current user and logs them out from all devices. The current access token will remain valid until it expires.',
  })
  @ApiAuthErrorResponses()
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or token expired',
  })
  async logout(@CurrentUser() user: User): Promise<{ message: string }> {
    return this.authService.logout(user.id);
  }
}
