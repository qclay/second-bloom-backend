import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IConversationRepository } from '../interfaces/conversation-repository.interface';
import { Prisma, Conversation } from '@prisma/client';

@Injectable()
export class ConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ConversationCreateInput): Promise<Conversation> {
    return await this.prisma.conversation.create({
      data,
    });
  }

  async findById(
    id: string,
    include?: Prisma.ConversationInclude,
  ): Promise<Conversation | null> {
    return await this.prisma.conversation.findUnique({
      where: { id },
      include,
    });
  }

  async findMany(
    where: Prisma.ConversationWhereInput,
    include?: Prisma.ConversationInclude,
    orderBy?: Prisma.ConversationOrderByWithRelationInput,
    take?: number,
    skip?: number,
  ): Promise<Conversation[]> {
    return await this.prisma.conversation.findMany({
      where,
      include,
      orderBy,
      take,
      skip,
    });
  }

  async findUnique(
    where: Prisma.ConversationWhereUniqueInput,
    include?: Prisma.ConversationInclude,
  ): Promise<Conversation | null> {
    return await this.prisma.conversation.findUnique({
      where,
      include,
    });
  }

  async update(
    where: Prisma.ConversationWhereUniqueInput,
    data: Prisma.ConversationUpdateInput,
  ): Promise<Conversation> {
    return await this.prisma.conversation.update({
      where,
      data,
    });
  }

  async count(where: Prisma.ConversationWhereInput): Promise<number> {
    return await this.prisma.conversation.count({
      where,
    });
  }

  async updateLastMessage(
    conversationId: string,
    messageId: string,
    lastMessageAt: Date,
  ): Promise<Conversation> {
    return await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageId: messageId,
        lastMessageAt,
      },
    });
  }
}
