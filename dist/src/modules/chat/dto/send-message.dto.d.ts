import { MessageType } from '@prisma/client';
export declare class SendMessageDto {
    conversationId: string;
    content: string;
    messageType?: MessageType;
    fileId?: string;
    replyToMessageId?: string;
}
