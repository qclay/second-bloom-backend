import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-success-responses.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiPaginatedResponse(
    NotificationResponseDto,
    'Paginated list of notifications',
  )
  @ApiCommonErrorResponses({ conflict: false })
  async findAll(
    @Query() query: NotificationQueryDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.notificationService.findAll(query, user.id, user.role);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count', type: Number })
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.notificationService.getUnreadCount(user.id);
    return { count };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: { id: string }) {
    const count = await this.notificationService.markAllAsRead(user.id);
    return { markedCount: count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @ApiCommonErrorResponses({ conflict: false })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.notificationService.findById(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification status (e.g. mark as read)' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @ApiCommonErrorResponses({ conflict: false })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.notificationService.updateNotification(
      id,
      dto,
      user.id,
      user.role,
    );
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 204, description: 'Notification marked as read' })
  @ApiCommonErrorResponses({ conflict: false })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    await this.notificationService.markAsRead(id, user.id, user.role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  @ApiCommonErrorResponses({ conflict: false })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    await this.notificationService.deleteNotification(id, user.id, user.role);
  }
}
