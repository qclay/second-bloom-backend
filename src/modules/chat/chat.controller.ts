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
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { ChatUsersQueryDto } from './dto/chat-users-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { ChatMessageResponseDto } from './dto/message-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SanitizePipe } from '../../common/pipes/sanitize.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-success-responses.decorator';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @UsePipes(new SanitizePipe())
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiCommonErrorResponses({ conflict: true })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: ConversationResponseDto,
  })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser('id') userId: string,
  ): Promise<ConversationResponseDto> {
    return this.chatService.createConversation(createConversationDto, userId);
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get users you can start a chat with',
    description:
      'Returns users you can chat with. Use otherUserId when creating a conversation to start a chat.',
  })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of users (data + total, page, limit)',
  })
  async getUsersForChat(
    @Query() query: ChatUsersQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getUsersForChat(userId, query);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
  })
  async getConversations(
    @Query() query: ConversationQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getConversations(query, userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Conversation details',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found',
    type: ApiErrorResponseDto,
  })
  async getConversationById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ConversationResponseDto> {
    return this.chatService.getConversationById(id, userId);
  }

  @Patch('conversations/:id')
  @UsePipes(new SanitizePipe())
  @ApiOperation({ summary: 'Update conversation (archive, block)' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Conversation updated',
    type: ConversationResponseDto,
  })
  async updateConversation(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
    @CurrentUser('id') userId: string,
  ): Promise<ConversationResponseDto> {
    return this.chatService.updateConversation(
      id,
      updateConversationDto,
      userId,
    );
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiPaginatedResponse(
    ChatMessageResponseDto,
    'Paginated list of messages (data + meta.pagination)',
  )
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: MessageQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getMessages(conversationId, query, userId);
  }

  @Get('conversations/:conversationId/unread-count')
  @ApiOperation({ summary: 'Get unread message count for a conversation' })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Unread message count',
  })
  async getUnreadCount(
    @Param('conversationId') conversationId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ count: number }> {
    return await this.chatService.getUnreadCount(conversationId, userId);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get total unread message count across all conversations',
  })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Total unread message count',
  })
  async getTotalUnreadCount(
    @CurrentUser('id') userId: string,
  ): Promise<{ count: number }> {
    return await this.chatService.getTotalUnreadCount(userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get chat statistics for current user' })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Chat statistics',
  })
  async getStatistics(@CurrentUser('id') userId: string): Promise<{
    totalConversations: number;
    unreadMessages: number;
    archivedConversations: number;
    totalMessages: number;
  }> {
    return await this.chatService.getStatistics(userId);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Message deleted',
    type: ChatMessageResponseDto,
  })
  async deleteMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ChatMessageResponseDto> {
    return this.chatService.deleteMessage(id, userId);
  }
}
