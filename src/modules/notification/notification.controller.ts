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
  UsePipes,
  ForbiddenException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { SanitizePipe } from '../../common/pipes/sanitize.pipe';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiPaginatedResponse,
} from '../../common/decorators/api-success-responses.decorator';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new notification (Admin only)' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiSuccessResponse(
    201,
    'Notification created successfully',
    NotificationResponseDto,
  )
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @CurrentUser('role') role: UserRole,
  ): Promise<NotificationResponseDto> {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create notifications');
    }
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiPaginatedResponse(NotificationResponseDto, 'List of notifications')
  async findAll(
    @Query() query: NotificationQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.notificationService.findAll(query, userId, role);
  }

  @Get('unread/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      'Returns the count of unread notifications for the current user. Useful for displaying badge counts in the UI.',
  })
  @ApiCommonErrorResponses({ conflict: false, notFound: false })
  @ApiSuccessResponse(200, 'Unread notification count retrieved successfully')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiSuccessResponse(200, 'Notification details', NotificationResponseDto)
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.findById(id, userId, role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new SanitizePipe())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiSuccessResponse(200, 'Notification updated', NotificationResponseDto)
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.updateNotification(
      id,
      updateNotificationDto,
      userId,
      role,
    );
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiSuccessResponse(204, 'Notification marked as read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return this.notificationService.markAsRead(id, userId, role);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiCommonErrorResponses({ conflict: false, notFound: false })
  @ApiSuccessResponse(200, 'All notifications marked as read')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    const count = await this.notificationService.markAllAsRead(userId);
    return { count };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete notification' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiSuccessResponse(204, 'Notification deleted')
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ): Promise<void> {
    return this.notificationService.deleteNotification(id, userId, role);
  }
}
