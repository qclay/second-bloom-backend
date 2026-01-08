export declare class MessageSenderDto {
    id: string;
    phoneNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
}
export declare class MessageFileDto {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
}
export declare class MessageResponseDto {
    id: string;
    conversationId: string;
    sender: MessageSenderDto;
    replyToMessageId?: string | null;
    messageType: string;
    content: string;
    file?: MessageFileDto | null;
    deliveryStatus: string;
    isRead: boolean;
    readAt?: Date | null;
    isEdited: boolean;
    editedAt?: Date | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
