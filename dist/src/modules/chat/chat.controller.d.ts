import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(createConversationDto: CreateConversationDto, userId: string): Promise<ConversationResponseDto>;
    getConversations(query: ConversationQueryDto, userId: string): Promise<{
        data: ConversationResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    getConversationById(id: string, userId: string): Promise<ConversationResponseDto>;
    updateConversation(id: string, updateConversationDto: UpdateConversationDto, userId: string): Promise<ConversationResponseDto>;
    getMessages(conversationId: string, query: MessageQueryDto, userId: string): Promise<{
        data: MessageResponseDto[];
        hasMore: boolean;
        nextCursor?: string;
    }>;
    getUnreadCount(conversationId: string, userId: string): Promise<{
        count: number;
    }>;
    getTotalUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    getStatistics(userId: string): Promise<{
        totalConversations: number;
        unreadMessages: number;
        archivedConversations: number;
        totalMessages: number;
    }>;
    deleteMessage(id: string, userId: string): Promise<MessageResponseDto>;
}
