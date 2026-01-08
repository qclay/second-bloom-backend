import { Message, Prisma } from '@prisma/client';

export interface IMessageRepository {
  create(data: Prisma.MessageCreateInput): Promise<Message>;
  findById(
    id: string,
    include?: Prisma.MessageInclude,
  ): Promise<Message | null>;
  findMany(
    where: Prisma.MessageWhereInput,
    include?: Prisma.MessageInclude,
    orderBy?: Prisma.MessageOrderByWithRelationInput,
    take?: number,
    skip?: number,
    cursor?: Prisma.MessageWhereUniqueInput,
  ): Promise<Message[]>;
  update(
    where: Prisma.MessageWhereUniqueInput,
    data: Prisma.MessageUpdateInput,
  ): Promise<Message>;
  updateMany(
    where: Prisma.MessageWhereInput,
    data: Prisma.MessageUpdateInput,
  ): Promise<{ count: number }>;
  count(where: Prisma.MessageWhereInput): Promise<number>;
  markAsRead(
    conversationId: string,
    userId: string,
    messageIds?: string[],
  ): Promise<{ count: number }>;
  updateDeliveryStatus(
    messageId: string,
    status: 'SENT' | 'DELIVERED' | 'READ',
  ): Promise<Message>;
}
