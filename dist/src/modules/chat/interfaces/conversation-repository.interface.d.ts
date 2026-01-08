import { Conversation, Prisma } from '@prisma/client';
export interface IConversationRepository {
    create(data: Prisma.ConversationCreateInput): Promise<Conversation>;
    findById(id: string, include?: Prisma.ConversationInclude): Promise<Conversation | null>;
    findMany(where: Prisma.ConversationWhereInput, include?: Prisma.ConversationInclude, orderBy?: Prisma.ConversationOrderByWithRelationInput, take?: number, skip?: number): Promise<Conversation[]>;
    findUnique(where: Prisma.ConversationWhereUniqueInput, include?: Prisma.ConversationInclude): Promise<Conversation | null>;
    update(where: Prisma.ConversationWhereUniqueInput, data: Prisma.ConversationUpdateInput): Promise<Conversation>;
    count(where: Prisma.ConversationWhereInput): Promise<number>;
    updateLastMessage(conversationId: string, messageId: string, lastMessageAt: Date): Promise<Conversation>;
    updateUnreadCount(conversationId: string, isSeller: boolean, increment: boolean): Promise<Conversation>;
    updateLastSeen(conversationId: string, isSeller: boolean, lastSeenAt: Date): Promise<Conversation>;
}
