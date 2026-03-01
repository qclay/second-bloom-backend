import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IMessageRepository } from '../interfaces/message-repository.interface';
import { Prisma, DeliveryStatus, Message } from '@prisma/client';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MessageCreateInput): Promise<Message> {
    return await this.prisma.message.create({
      data,
    });
  }

  async findById(
    id: string,
    include?: Prisma.MessageInclude,
  ): Promise<Message | null> {
    return await this.prisma.message.findUnique({
      where: { id },
      include,
    });
  }

  async findMany(
    where: Prisma.MessageWhereInput,
    include?: Prisma.MessageInclude,
    orderBy?: Prisma.MessageOrderByWithRelationInput,
    take?: number,
    skip?: number,
    cursor?: Prisma.MessageWhereUniqueInput,
  ): Promise<Message[]> {
    return await this.prisma.message.findMany({
      where,
      include,
      orderBy,
      take,
      skip,
      cursor,
    });
  }

  async update(
    where: Prisma.MessageWhereUniqueInput,
    data: Prisma.MessageUpdateInput,
  ): Promise<Message> {
    return await this.prisma.message.update({
      where,
      data,
    });
  }

  async updateMany(
    where: Prisma.MessageWhereInput,
    data: Prisma.MessageUpdateInput,
  ): Promise<{ count: number }> {
    return await this.prisma.message.updateMany({
      where,
      data,
    });
  }

  async count(where: Prisma.MessageWhereInput): Promise<number> {
    return await this.prisma.message.count({
      where,
    });
  }

  async markAsRead(
    conversationId: string,
    userId: string,
    messageIds?: string[],
  ): Promise<{ count: number }> {
    const where: Prisma.MessageWhereInput = {
      conversationId,
      senderId: { not: userId },
      isRead: false,
      isDeleted: false,
    };

    if (messageIds && messageIds.length > 0) {
      where.id = { in: messageIds };
    }

    return await this.prisma.message.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
        deliveryStatus: DeliveryStatus.READ,
      },
    });
  }

  async updateDeliveryStatus(
    messageId: string,
    status: 'SENT' | 'DELIVERED' | 'READ',
  ): Promise<Message> {
    return await this.prisma.message.update({
      where: { id: messageId },
      data: {
        deliveryStatus: status as DeliveryStatus,
        ...(status === 'READ' && {
          isRead: true,
          readAt: new Date(),
        }),
      },
    });
  }
}
