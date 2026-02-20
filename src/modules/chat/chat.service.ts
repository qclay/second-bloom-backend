import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import {
  ConversationResponseDto,
  ConversationSellerBuyerDto,
} from './dto/conversation-response.dto';
import { ChatMessageResponseDto } from './dto/message-response.dto';
import { ChatUsersQueryDto } from './dto/chat-users-query.dto';
import { ChatUserItemDto } from './dto/chat-user-item.dto';
import { Prisma, MessageType, DeliveryStatus } from '@prisma/client';
import { resolveTranslation } from '../../common/i18n/translation.util';

const CONVERSATION_INCLUDE = {
  participants: {
    include: {
      user: {
        select: {
          id: true,
          username: true,
          phoneNumber: true,
          phoneCountryCode: true,
          firstName: true,
          lastName: true,
          avatar: { select: { url: true } },
        },
      },
    },
  },
  lastMessage: true,
  product: {
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          phoneCountryCode: true,
          avatar: { select: { url: true } },
        },
      },
      images: {
        take: 1,
        orderBy: { displayOrder: 'asc' as const },
        select: { file: { select: { url: true } } },
      },
    },
  },
  order: {
    include: {
      buyer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          phoneCountryCode: true,
          avatar: { select: { url: true } },
        },
      },
    },
  },
} as const;

type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: typeof CONVERSATION_INCLUDE;
}>;

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: {
    sender: {
      select: {
        id: true;
        phoneNumber: true;
        firstName: true;
        lastName: true;
        avatar: { select: { url: true } };
      };
    };
    file: {
      select: {
        id: true;
        url: true;
        filename: true;
        mimeType: true;
        size: true;
      };
    };
  };
}>;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createConversation(
    dto: CreateConversationDto,
    userId: string,
  ): Promise<ConversationResponseDto> {
    if (!dto.otherUserId) {
      throw new BadRequestException('otherUserId is required');
    }
    if (dto.otherUserId === userId) {
      throw new BadRequestException(
        'You cannot start a conversation with yourself',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let productId: string | undefined;
      let orderId: string | undefined;

      if (dto.productId) {
        const product = await tx.product.findFirst({
          where: { id: dto.productId, deletedAt: null, isActive: true },
          select: { id: true, sellerId: true },
        });
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        const sellerId = product.sellerId;
        const isSeller = userId === sellerId || dto.otherUserId === sellerId;
        if (!isSeller) {
          throw new BadRequestException(
            'One participant must be the product seller to pin this product',
          );
        }
        productId = product.id;
      }

      if (dto.orderId) {
        const order = await tx.order.findFirst({
          where: { id: dto.orderId, deletedAt: null, isActive: true },
          include: { product: { select: { sellerId: true } } },
        });
        if (!order) {
          throw new NotFoundException('Order not found');
        }
        const buyerId = order.buyerId;
        const sellerId = order.product.sellerId;
        const allowed =
          (userId === buyerId && dto.otherUserId === sellerId) ||
          (userId === sellerId && dto.otherUserId === buyerId);
        if (!allowed) {
          throw new BadRequestException(
            'Conversation participants must be the order buyer and seller to pin this order',
          );
        }
        if (productId && order.productId !== productId) {
          throw new BadRequestException(
            'Pinned order must be for the pinned product',
          );
        }
        orderId = order.id;
      }

      const sameProductFilter =
        productId !== undefined
          ? productId
            ? { productId }
            : { productId: null }
          : { productId: null };
      const sameOrderFilter =
        orderId !== undefined
          ? orderId
            ? { orderId }
            : { orderId: null }
          : { orderId: null };

      let conversation = await tx.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: dto.otherUserId } } },
            { deletedAt: null },
            sameProductFilter,
            sameOrderFilter,
          ],
        },
        include: CONVERSATION_INCLUDE,
      });

      if (conversation) {
        if (dto.initialMessage) {
          await this.sendMessageInternal(
            {
              conversationId: conversation.id,
              content: dto.initialMessage,
              messageType: MessageType.TEXT,
            },
            userId,
            tx,
          );
          conversation = (await tx.conversation.findUnique({
            where: { id: conversation.id },
            include: CONVERSATION_INCLUDE,
          })) as ConversationWithRelations;
        }
        if (productId !== undefined || orderId !== undefined) {
          await tx.conversation.update({
            where: { id: conversation.id },
            data: {
              ...(productId !== undefined && {
                product: productId
                  ? { connect: { id: productId } }
                  : { disconnect: true },
              }),
              ...(orderId !== undefined && {
                order: orderId
                  ? { connect: { id: orderId } }
                  : { disconnect: true },
              }),
            },
          });
          conversation = (await tx.conversation.findUnique({
            where: { id: conversation.id },
            include: CONVERSATION_INCLUDE,
          })) as ConversationWithRelations;
        }
        return this.mapConversationToDto(
          conversation as ConversationWithRelations,
          userId,
        );
      }

      const created = await tx.conversation.create({
        data: {
          participants: {
            create: [{ userId }, { userId: dto.otherUserId }],
          },
          ...(productId && { product: { connect: { id: productId } } }),
          ...(orderId && { order: { connect: { id: orderId } } }),
        },
        include: CONVERSATION_INCLUDE,
      });

      if (dto.initialMessage) {
        await this.sendMessageInternal(
          {
            conversationId: created.id,
            content: dto.initialMessage,
            messageType: MessageType.TEXT,
          },
          userId,
          tx,
        );

        const refreshed = await tx.conversation.findUnique({
          where: { id: created.id },
          include: CONVERSATION_INCLUDE,
        });

        if (!refreshed) {
          throw new NotFoundException('Conversation not found');
        }

        return this.mapConversationToDto(refreshed, userId);
      }

      return this.mapConversationToDto(created, userId);
    });
  }

  async getUsersForChat(
    userId: string,
    query: ChatUsersQueryDto,
  ): Promise<{
    data: ChatUserItemDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where: Prisma.UserWhereInput = {
      id: { not: userId },
      deletedAt: null,
      isActive: true,
      ...(search &&
        search.length > 0 && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } },
          ],
        }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phoneNumber: true,
          phoneCountryCode: true,
          firstName: true,
          lastName: true,
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data: ChatUserItemDto[] = users.map((u) => ({
      id: u.id,
      phoneNumber: u.phoneCountryCode
        ? `${u.phoneCountryCode}${u.phoneNumber}`
        : u.phoneNumber,
      firstName: u.firstName,
      lastName: u.lastName,
      productCount: 0,
    }));

    return { data, total, page, limit };
  }

  async getConversations(
    query: ConversationQueryDto,
    userId: string,
  ): Promise<{
    data: ConversationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ConversationWhereInput = {
      participants: {
        some: {
          userId,
          ...(query.archived !== undefined && { isArchived: query.archived }),
        },
      },
      deletedAt: null,
    };

    const [conversations, total] = await Promise.all([
      this.conversationRepository.findMany(
        where,
        CONVERSATION_INCLUDE,
        { lastMessageAt: 'desc' },
        limit,
        skip,
      ),
      this.conversationRepository.count(where),
    ]);

    return {
      data: conversations.map((conv) =>
        this.mapConversationToDto(conv as ConversationWithRelations, userId),
      ),
      total,
      page,
      limit,
    };
  }

  async getConversationById(
    id: string,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationRepository.findById(
      id,
      CONVERSATION_INCLUDE,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const conv = conversation as unknown as ConversationWithRelations;
    const isParticipant = conv.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return this.mapConversationToDto(conv, userId);
  }

  async sendMessage(
    dto: SendMessageDto,
    userId: string,
  ): Promise<ChatMessageResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      return this.sendMessageInternal(dto, userId, tx);
    });
  }

  private async sendMessageInternal(
    dto: SendMessageDto,
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<ChatMessageResponseDto> {
    const conversation = await tx.conversation.findUnique({
      where: { id: dto.conversationId },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const myParticipant = conversation.participants.find(
      (p) => p.userId === userId,
    );
    if (!myParticipant) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    if (conversation.deletedAt) {
      throw new BadRequestException('Conversation has been deleted');
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== userId,
    );
    if (otherParticipant?.isBlocked) {
      throw new ForbiddenException('You are blocked in this conversation');
    }

    if (dto.fileId) {
      const file = await tx.file.findUnique({
        where: { id: dto.fileId },
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      if (file.uploadedById !== userId) {
        throw new ForbiddenException('You can only send files you uploaded');
      }
    }

    if (dto.replyToMessageId) {
      const replyToMessage = await tx.message.findUnique({
        where: { id: dto.replyToMessageId },
      });

      if (!replyToMessage) {
        throw new NotFoundException('Message to reply to not found');
      }

      if (replyToMessage.conversationId !== dto.conversationId) {
        throw new BadRequestException(
          'Reply message must be from the same conversation',
        );
      }
    }

    const message = await tx.message.create({
      data: {
        conversation: { connect: { id: dto.conversationId } },
        sender: { connect: { id: userId } },
        messageType: dto.messageType || MessageType.TEXT,
        content: dto.content,
        ...(dto.fileId && { file: { connect: { id: dto.fileId } } }),
        ...(dto.replyToMessageId && {
          replyTo: { connect: { id: dto.replyToMessageId } },
        }),
        deliveryStatus: DeliveryStatus.SENT,
      },
      include: {
        sender: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            avatar: { select: { url: true } },
          },
        },
        file: {
          select: {
            id: true,
            url: true,
            filename: true,
            mimeType: true,
            size: true,
          },
        },
      },
    });

    await tx.conversation.update({
      where: { id: dto.conversationId },
      data: {
        lastMessageId: message.id,
        lastMessageAt: message.createdAt,
      },
    });

    if (otherParticipant) {
      await tx.conversationParticipant.update({
        where: { id: otherParticipant.id },
        data: { unreadCount: { increment: 1 } },
      });
    }

    const sender = myParticipant.user;
    const senderName =
      sender.firstName || sender.lastName || sender.phoneNumber || null;

    if (otherParticipant) {
      try {
        await this.notificationService.notifyNewMessage({
          recipientId: otherParticipant.userId,
          conversationId: dto.conversationId,
          senderName,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send NEW_MESSAGE notification for conversation ${dto.conversationId}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    return this.mapMessageToDto(message);
  }

  async getMessages(
    conversationId: string,
    query: MessageQueryDto,
    userId: string,
  ): Promise<{
    data: ChatMessageResponseDto[];
    hasMore: boolean;
    nextCursor?: string;
  }> {
    const conversation = await this.conversationRepository.findById(
      conversationId,
      { participants: true },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const conv = conversation as unknown as {
      participants: { userId: string }[];
    };
    if (!conv.participants.some((p) => p.userId === userId)) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    const limit = Math.min(query.limit || 50, 100);
    let cursorCreatedAt: Date | undefined;
    if (query.cursor) {
      const cursorMessage = await this.messageRepository.findById(query.cursor);
      if (cursorMessage) {
        cursorCreatedAt = cursorMessage.createdAt;
      }
    }

    const where: Prisma.MessageWhereInput = {
      conversationId,
      isDeleted: false,
      ...(cursorCreatedAt && {
        createdAt: { lt: cursorCreatedAt },
      }),
    };

    const messages = await this.messageRepository.findMany(
      where,
      {
        sender: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            avatar: { select: { url: true } },
          },
        },
        file: {
          select: {
            id: true,
            url: true,
            filename: true,
            mimeType: true,
            size: true,
          },
        },
      },
      { createdAt: 'desc' },
      limit + 1,
    );

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, -1) : messages;

    return {
      data: data
        .reverse()
        .map((msg) => this.mapMessageToDto(msg as MessageWithRelations)),
      hasMore,
      nextCursor: hasMore ? data[data.length - 1]?.id : undefined,
    };
  }

  async markMessagesAsRead(
    dto: MarkMessagesReadDto,
    userId: string,
  ): Promise<{ count: number }> {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: dto.conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    const result = await this.messageRepository.markAsRead(
      dto.conversationId,
      userId,
      dto.messageIds,
    );

    if (participant.unreadCount > 0) {
      await this.prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: {
          unreadCount: Math.max(0, participant.unreadCount - result.count),
          lastSeenAt: new Date(),
        },
      });
    } else {
      await this.prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastSeenAt: new Date() },
      });
    }

    return result;
  }

  async updateConversation(
    id: string,
    dto: UpdateConversationDto,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { participants: { select: { userId: true } } },
    });

    if (!conversation || conversation.deletedAt) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId: id, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    const participantUpdateData: Prisma.ConversationParticipantUpdateInput = {};
    if (dto.isArchived !== undefined) {
      participantUpdateData.isArchived = dto.isArchived;
    }
    if (dto.isBlocked !== undefined) {
      participantUpdateData.isBlocked = dto.isBlocked;
    }
    if (Object.keys(participantUpdateData).length > 0) {
      await this.prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: participantUpdateData,
      });
    }

    const conversationUpdateData: Prisma.ConversationUpdateInput = {};
    const participantIds = conversation.participants.map((p) => p.userId);

    if (dto.productId !== undefined) {
      if (dto.productId) {
        const product = await this.prisma.product.findFirst({
          where: { id: dto.productId, deletedAt: null, isActive: true },
          select: { sellerId: true },
        });
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        if (!participantIds.includes(product.sellerId)) {
          throw new BadRequestException(
            'Product seller must be a conversation participant',
          );
        }
        conversationUpdateData.product = { connect: { id: dto.productId } };
      } else {
        conversationUpdateData.product = { disconnect: true };
      }
    }
    if (dto.orderId !== undefined) {
      if (dto.orderId) {
        const order = await this.prisma.order.findFirst({
          where: { id: dto.orderId, deletedAt: null, isActive: true },
          include: { product: { select: { sellerId: true } } },
        });
        if (!order) {
          throw new NotFoundException('Order not found');
        }
        const allowed =
          participantIds.includes(order.buyerId) &&
          participantIds.includes(order.product.sellerId);
        if (!allowed) {
          throw new BadRequestException(
            'Order buyer and seller must be conversation participants',
          );
        }
        conversationUpdateData.order = { connect: { id: dto.orderId } };
      } else {
        conversationUpdateData.order = { disconnect: true };
      }
    }
    if (Object.keys(conversationUpdateData).length > 0) {
      await this.conversationRepository.update({ id }, conversationUpdateData);
    }

    const updated = await this.conversationRepository.findById(
      id,
      CONVERSATION_INCLUDE,
    );

    if (!updated) {
      throw new NotFoundException('Conversation not found');
    }

    return this.mapConversationToDto(
      updated as unknown as ConversationWithRelations,
      userId,
    );
  }

  async deleteMessage(
    messageId: string,
    userId: string,
  ): Promise<ChatMessageResponseDto> {
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    if (message.isDeleted) {
      throw new BadRequestException('Message is already deleted');
    }

    await this.messageRepository.update(
      { id: messageId },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        content: 'This message was deleted',
      },
    );

    const messageWithRelations = await this.messageRepository.findById(
      messageId,
      {
        sender: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            avatar: { select: { url: true } },
          },
        },
        file: {
          select: {
            id: true,
            url: true,
            filename: true,
            mimeType: true,
            size: true,
          },
        },
      },
    );

    if (!messageWithRelations) {
      throw new NotFoundException('Message not found after update');
    }

    return this.mapMessageToDto(messageWithRelations as MessageWithRelations);
  }

  async editMessage(
    messageId: string,
    content: string,
    userId: string,
  ): Promise<ChatMessageResponseDto> {
    if (content.length > 5000) {
      throw new BadRequestException('Message content too long');
    }

    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit deleted message');
    }

    await this.messageRepository.update(
      { id: messageId },
      {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    );

    const messageWithRelations = await this.messageRepository.findById(
      messageId,
      {
        sender: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            avatar: { select: { url: true } },
          },
        },
        file: {
          select: {
            id: true,
            url: true,
            filename: true,
            mimeType: true,
            size: true,
          },
        },
      },
    );

    if (!messageWithRelations) {
      throw new NotFoundException('Message not found after update');
    }

    return this.mapMessageToDto(messageWithRelations as MessageWithRelations);
  }

  async getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<{ count: number }> {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return { count: participant.unreadCount };
  }

  async getTotalUnreadCount(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.conversationParticipant.aggregate({
      where: {
        userId,
        conversation: { deletedAt: null },
      },
      _sum: { unreadCount: true },
    });

    return { count: result._sum.unreadCount ?? 0 };
  }

  async getStatistics(userId: string): Promise<{
    totalConversations: number;
    unreadMessages: number;
    archivedConversations: number;
    totalMessages: number;
  }> {
    const [participants, unreadCount, messagesCount] = await Promise.all([
      this.prisma.conversationParticipant.findMany({
        where: {
          userId,
          conversation: { deletedAt: null },
        },
        select: {
          unreadCount: true,
          isArchived: true,
        },
      }),
      this.getTotalUnreadCount(userId),
      this.prisma.message.count({
        where: {
          conversation: {
            participants: { some: { userId } },
            deletedAt: null,
          },
          deletedAt: null,
        },
      }),
    ]);

    const archived = participants.filter((p) => p.isArchived).length;

    return {
      totalConversations: participants.length,
      unreadMessages: unreadCount.count,
      archivedConversations: archived,
      totalMessages: messagesCount,
    };
  }

  async getConversationIds(userId: string): Promise<string[]> {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { userId, conversation: { deletedAt: null } },
      select: { conversationId: true },
    });
    return participants.map((p) => p.conversationId);
  }

  async getOtherParticipantId(
    conversationId: string,
    userId: string,
  ): Promise<string | null> {
    const other = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: { not: userId } },
      select: { userId: true },
    });
    return other?.userId ?? null;
  }

  isUserOnline(userId: string): boolean {
    return this._onlineUsers.has(userId);
  }

  private _onlineUsers = new Set<string>();

  setUserOnline(userId: string): void {
    this._onlineUsers.add(userId);
  }

  setUserOffline(userId: string): void {
    this._onlineUsers.delete(userId);
  }

  getOnlineUserIds(): Set<string> {
    return this._onlineUsers;
  }

  private mapUserToSellerBuyer(u: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
    phoneCountryCode: string | null;
    avatar: { url: string } | null;
  }): ConversationSellerBuyerDto {
    const phoneNumber = u.phoneCountryCode
      ? `${u.phoneCountryCode}${u.phoneNumber}`
      : u.phoneNumber;
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      phoneNumber,
      avatarUrl: u.avatar?.url ?? null,
    };
  }

  private mapConversationToDto(
    conversation: ConversationWithRelations,
    userId: string,
  ): ConversationResponseDto {
    const myParticipant = conversation.participants.find(
      (p) => p.userId === userId,
    );

    const participants = conversation.participants.map((p) => {
      const u = p.user;
      const phoneNumber = u.phoneCountryCode
        ? `${u.phoneCountryCode}${u.phoneNumber}`
        : u.phoneNumber;
      return {
        userId: u.id,
        username: u.username ?? null,
        phoneNumber,
        firstName: u.firstName,
        lastName: u.lastName,
        avatarUrl: u.avatar?.url || null,
      };
    });

    let seller: ConversationResponseDto['seller'] = null;
    let buyer: ConversationResponseDto['buyer'] = null;
    let pinnedProduct: ConversationResponseDto['pinnedProduct'] = null;
    let pinnedOrder: ConversationResponseDto['pinnedOrder'] = null;

    const conv = conversation as ConversationWithRelations & {
      product?: {
        id: string;
        slug: string;
        title: unknown;
        price: { toNumber?: () => number };
        currency: string;
        seller?: {
          id: string;
          firstName: string | null;
          lastName: string | null;
          phoneNumber: string;
          phoneCountryCode: string | null;
          avatar: { url: string } | null;
        };
        images?: { file: { url: string } }[];
      };
      order?: {
        id: string;
        orderNumber: string;
        amount: { toNumber?: () => number };
        status: string;
        shippedAt: Date | null;
        deliveredAt: Date | null;
        buyer?: {
          id: string;
          firstName: string | null;
          lastName: string | null;
          phoneNumber: string;
          phoneCountryCode: string | null;
          avatar: { url: string } | null;
        };
      };
    };

    if (conv.product) {
      const p = conv.product;
      const price =
        typeof p.price === 'object' && p.price && 'toNumber' in p.price
          ? (p.price as { toNumber: () => number }).toNumber()
          : Number(p.price);
      seller = p.seller
        ? this.mapUserToSellerBuyer({
            ...p.seller,
            avatar: p.seller.avatar ? { url: p.seller.avatar.url } : null,
          })
        : null;
      pinnedProduct = {
        id: p.id,
        slug: p.slug,
        title:
          resolveTranslation(p.title as Record<string, string>, null) ?? '',
        price,
        currency: p.currency,
        imageUrl: p.images?.[0]?.file?.url ?? null,
      };
    }

    if (conv.order) {
      const o = conv.order;
      const amount =
        typeof o.amount === 'object' && o.amount && 'toNumber' in o.amount
          ? (o.amount as { toNumber: () => number }).toNumber()
          : Number(o.amount);
      if (o.buyer) {
        buyer = this.mapUserToSellerBuyer({
          ...o.buyer,
          avatar: o.buyer.avatar ? { url: o.buyer.avatar.url } : null,
        });
      }
      pinnedOrder = {
        id: o.id,
        orderNumber: o.orderNumber,
        amount,
        status: o.status,
        progress: {
          status: o.status,
          shippedAt: o.shippedAt ?? undefined,
          deliveredAt: o.deliveredAt ?? undefined,
        },
      };
    }

    if (
      !buyer &&
      conv.product?.seller &&
      conversation.participants.length === 2
    ) {
      const other = conversation.participants.find(
        (p) => p.userId !== conv.product.seller.id,
      );
      if (other?.user) {
        buyer = this.mapUserToSellerBuyer({
          id: other.user.id,
          firstName: other.user.firstName,
          lastName: other.user.lastName,
          phoneNumber: other.user.phoneNumber,
          phoneCountryCode: other.user.phoneCountryCode,
          avatar: other.user.avatar,
        });
      }
    }

    return {
      id: conversation.id,
      flowerId: conv.product?.id ?? null,
      participants,
      unreadCount: myParticipant?.unreadCount ?? 0,
      isArchived: myParticipant?.isArchived ?? false,
      isBlocked: myParticipant?.isBlocked ?? false,
      lastMessageAt: conversation.lastMessageAt,
      lastMessage: conversation.lastMessage
        ? {
            id: conversation.lastMessage.id,
            content: conversation.lastMessage.content,
            messageType: conversation.lastMessage.messageType,
            createdAt: conversation.lastMessage.createdAt,
            isRead: conversation.lastMessage.isRead,
          }
        : null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      seller: seller ?? undefined,
      buyer: buyer ?? undefined,
      pinnedProduct: pinnedProduct ?? undefined,
      pinnedOrder: pinnedOrder ?? undefined,
    };
  }

  private mapMessageToDto(
    message: MessageWithRelations,
  ): ChatMessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      sender: {
        id: message.sender.id,
        phoneNumber: message.sender.phoneNumber,
        firstName: message.sender.firstName,
        lastName: message.sender.lastName,
        avatarUrl: message.sender.avatar?.url || null,
      },
      replyToMessageId: message.replyToMessageId,
      messageType: message.messageType,
      content: message.content,
      file: message.file
        ? {
            id: message.file.id,
            url: message.file.url,
            filename: message.file.filename,
            mimeType: message.file.mimeType,
            size: message.file.size,
          }
        : null,
      deliveryStatus: message.deliveryStatus,
      isRead: message.isRead,
      readAt: message.readAt,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
