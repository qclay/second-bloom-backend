import {
  Controller,
  Get,
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
import { ConversationService } from './conversation.service';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { SearchMessagesQueryDto } from './dto/search-messages-query.dto';
import { SearchMessagesResponseDto } from './dto/search-messages-response.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { ConversationMessageResponseDto } from './dto/message-response.dto';
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

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
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
    return this.conversationService.getConversations(query, userId);
  }

  @Get(':id')
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
    return this.conversationService.getConversationById(id, userId);
  }

  @Patch(':id')
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
    return this.conversationService.updateConversation(
      id,
      updateConversationDto,
      userId,
    );
  }

  @Get('messages/search')
  @ApiOperation({
    summary: 'Search messages',
    description:
      'Search message content across all conversations of the current user. Returns matching messages with conversation title.',
  })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Matching messages with conversation title',
    type: SearchMessagesResponseDto,
  })
  async searchMessages(
    @Query() query: SearchMessagesQueryDto,
    @CurrentUser('id') userId: string,
  ): Promise<SearchMessagesResponseDto> {
    return this.conversationService.searchMessages(
      userId,
      query.q ?? '',
      query.limit ?? 20,
    );
  }

  @Get(':conversationId/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiCommonErrorResponses({ notFound: false, conflict: false })
  @ApiPaginatedResponse(
    ConversationMessageResponseDto,
    'Paginated list of messages (data + meta.pagination)',
  )
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: MessageQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationService.getMessages(conversationId, query, userId);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiCommonErrorResponses({ conflict: false })
  @ApiResponse({
    status: 200,
    description: 'Message deleted',
    type: ConversationMessageResponseDto,
  })
  async deleteMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<ConversationMessageResponseDto> {
    return this.conversationService.deleteMessage(id, userId);
  }
}
