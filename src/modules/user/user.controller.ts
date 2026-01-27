import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { SendPhoneChangeOtpDto } from './dto/send-phone-change-otp.dto';
import { VerifyPhoneChangeDto } from './dto/verify-phone-change.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MessageResponseDto } from '../auth/dto/message-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    type: UserResponseDto,
  })
  async getProfile(
    @CurrentUser() user: { id: string },
  ): Promise<UserResponseDto> {
    return this.userService.findProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated',
    type: UserResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateProfile(user.id, updateProfileDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (Own profile or Admin)' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserResponseDto,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ): Promise<UserResponseDto> {
    return this.userService.findById(id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: { id: string },
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(id, updateUserDto, user.id);
  }

  @Post('fcm-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register or update FCM token' })
  @ApiResponse({
    status: 200,
    description: 'FCM token updated',
    type: UserResponseDto,
  })
  async updateFcmToken(
    @CurrentUser() user: { id: string },
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateFcmToken(user.id, updateFcmTokenDto);
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user profile' })
  @ApiResponse({ status: 204, description: 'Profile deleted' })
  async deleteProfile(@CurrentUser() user: { id: string }): Promise<void> {
    return this.userService.deleteUser(user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user',
    description:
      'Users can delete their own account. Admins can delete any user.',
  })
  @ApiResponse({ status: 204, description: 'User deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }

  @Post('phone/send-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Send OTP to new phone number for verification',
    description:
      'Sends a verification code to the new phone number. The code must be verified before the phone number can be updated.',
  })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: MessageResponseDto,
  })
  async sendPhoneChangeOtp(
    @CurrentUser() user: { id: string },
    @Body() sendPhoneChangeOtpDto: SendPhoneChangeOtpDto,
  ): Promise<MessageResponseDto> {
    return this.userService.sendPhoneChangeOtp(user.id, sendPhoneChangeOtpDto);
  }

  @Post('phone/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify OTP and update phone number',
    description:
      'Verifies the OTP code sent to the new phone number and updates the user phone number if verification is successful.',
  })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 200,
    description: 'Phone number updated successfully',
    type: UserResponseDto,
  })
  async verifyPhoneChange(
    @CurrentUser() user: { id: string },
    @Body() verifyPhoneChangeDto: VerifyPhoneChangeDto,
  ): Promise<UserResponseDto> {
    return this.userService.verifyPhoneChange(user.id, verifyPhoneChangeDto);
  }
}
