import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
interface AuthenticatedSocket extends Socket {
    userId?: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly jwtService;
    private readonly configService;
    server: Server;
    private readonly logger;
    private readonly userSockets;
    constructor(chatService: ChatService, jwtService: JwtService, configService: ConfigService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleJoinConversation(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): Promise<{
        error: string;
        success?: undefined;
        conversationId?: undefined;
    } | {
        success: boolean;
        conversationId: string;
        error?: undefined;
    }>;
    handleLeaveConversation(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): {
        error: string;
        success?: undefined;
        conversationId?: undefined;
    } | {
        success: boolean;
        conversationId: string;
        error?: undefined;
    };
    handleSendMessage(client: AuthenticatedSocket, data: SendMessageDto): Promise<{
        success: boolean;
        message?: MessageResponseDto;
        error?: string;
    }>;
    handleTypingStart(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): {
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    };
    handleTypingStop(client: AuthenticatedSocket, data: {
        conversationId: string;
    }): {
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    };
    handleMarkRead(client: AuthenticatedSocket, data: {
        conversationId: string;
        messageIds?: string[];
    }): Promise<{
        error: string;
        success?: undefined;
        count?: undefined;
    } | {
        success: boolean;
        count: number;
        error?: undefined;
    }>;
    handleDeleteMessage(client: AuthenticatedSocket, data: {
        messageId: string;
    }): Promise<{
        success: boolean;
        message?: MessageResponseDto;
        error?: string;
    }>;
    handleEditMessage(client: AuthenticatedSocket, data: {
        messageId: string;
        content: string;
    }): Promise<{
        success: boolean;
        message?: MessageResponseDto;
        error?: string;
    }>;
    notifyNewMessage(conversationId: string, message: MessageResponseDto, recipientId: string): void;
    notifyMessageRead(conversationId: string, userId: string, count: number): void;
    private sendToUser;
    private addUserSocket;
    private removeUserSocket;
    private extractTokenFromSocket;
}
export {};
