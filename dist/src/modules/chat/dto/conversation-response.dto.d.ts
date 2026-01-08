export declare class ConversationParticipantDto {
    id: string;
    phoneNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
}
export declare class ConversationLastMessageDto {
    id: string;
    content: string;
    messageType: string;
    createdAt: Date;
    isRead: boolean;
}
export declare class ConversationResponseDto {
    id: string;
    seller: ConversationParticipantDto;
    buyer: ConversationParticipantDto;
    orderId?: string | null;
    productId?: string | null;
    unreadCount: number;
    isArchived: boolean;
    isBlocked: boolean;
    lastMessageAt?: Date | null;
    lastMessage?: ConversationLastMessageDto | null;
    createdAt: Date;
    updatedAt: Date;
}
