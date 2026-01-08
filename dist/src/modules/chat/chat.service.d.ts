import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
export declare class ChatService {
    private readonly conversationRepository;
    private readonly messageRepository;
    private readonly prisma;
    private readonly logger;
    constructor(conversationRepository: ConversationRepository, messageRepository: MessageRepository, prisma: PrismaService);
    createConversation(dto: CreateConversationDto, userId: string): Promise<ConversationResponseDto>;
    getConversations(query: ConversationQueryDto, userId: string): Promise<{
        data: ConversationResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    getConversationById(id: string, userId: string): Promise<ConversationResponseDto>;
    sendMessage(dto: SendMessageDto, userId: string): Promise<MessageResponseDto>;
    private sendMessageInternal;
    getMessages(conversationId: string, query: MessageQueryDto, userId: string): Promise<{
        data: MessageResponseDto[];
        hasMore: boolean;
        nextCursor?: string;
    }>;
    markMessagesAsRead(dto: MarkMessagesReadDto, userId: string): Promise<{
        count: number;
    }>;
    updateConversation(id: string, dto: UpdateConversationDto, userId: string): Promise<ConversationResponseDto>;
    deleteMessage(messageId: string, userId: string): Promise<MessageResponseDto>;
    editMessage(messageId: string, content: string, userId: string): Promise<MessageResponseDto>;
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
    private mapConversationToDto;
    private mapMessageToDto;
}
