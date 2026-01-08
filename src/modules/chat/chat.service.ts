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
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { Prisma, MessageType, DeliveryStatus } from '@prisma/client';

type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: {
    seller: {
      select: {
        id: true;
        phoneNumber: true;
        firstName: true;
        lastName: true;
        avatar: { select: { url: true } };
      };
    };
    buyer: {
      select: {
        id: true;
        phoneNumber: true;
        firstName: true;
        lastName: true;
        avatar: { select: { url: true } };
      };
    };
    lastMessage: true;
  };
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
  ) {}

  async createConversation(
    dto: CreateConversationDto,
    userId: string,
  ): Promise<ConversationResponseDto> {
    if (!dto.productId && !dto.orderId) {
      throw new BadRequestException(
        'Either productId or orderId must be provided',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let sellerId: string;
      const buyerId = userId;
      let productId = dto.productId;
      let orderId = dto.orderId;

      if (dto.orderId) {
        const order = await tx.order.findUnique({
          where: { id: dto.orderId },
          include: { product: true },
        });

        if (!order) {
          throw new NotFoundException('Order not found');
        }

        if (order.buyerId !== userId) {
          throw new ForbiddenException(
            'You can only create conversations for your own orders',
          );
        }

        sellerId = order.product.sellerId;
        productId = order.productId;
        orderId = order.id;
      } else if (dto.productId) {
        const product = await tx.product.findUnique({
          where: { id: dto.productId },
        });

        if (!product) {
          throw new NotFoundException('Product not found');
        }

        if (product.sellerId === userId) {
          throw new BadRequestException(
            'You cannot start a conversation with yourself',
          );
        }

        sellerId = product.sellerId;
      } else {
        throw new BadRequestException('Invalid conversation context');
      }

      const existingConversation = await tx.conversation.findFirst({
        where: {
          sellerId,
          buyerId,
          ...(orderId ? { orderId } : { productId }),
          deletedAt: null,
        },
      });

      if (existingConversation) {
        const conversation = await tx.conversation.findUnique({
          where: { id: existingConversation.id },
          include: {
            seller: {
              select: {
                id: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                avatar: {
                  select: {
                    url: true,
                  },
                },
              },
            },
            buyer: {
              select: {
                id: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                avatar: {
                  select: {
                    url: true,
                  },
                },
              },
            },
            lastMessage: true,
          },
        });

        if (!conversation) {
          throw new NotFoundException('Conversation not found');
        }

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
        }

        return this.mapConversationToDto(
          conversation as ConversationWithRelations,
          userId,
        );
      }

      const conversation = await tx.conversation.create({
        data: {
          seller: { connect: { id: sellerId } },
          buyer: { connect: { id: buyerId } },
          ...(orderId ? { order: { connect: { id: orderId } } } : {}),
          ...(productId ? { product: { connect: { id: productId } } } : {}),
        },
      });

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
      }

      const fullConversation = await tx.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          seller: {
            select: {
              id: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              avatar: {
                select: {
                  url: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              avatar: {
                select: {
                  url: true,
                },
              },
            },
          },
          lastMessage: true,
        },
      });

      if (!fullConversation) {
        throw new NotFoundException('Conversation not found');
      }

      return this.mapConversationToDto(fullConversation, userId);
    });
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
      OR: [{ sellerId: userId }, { buyerId: userId }],
      deletedAt: null,
      ...(query.archived !== undefined && {
        OR: [
          { sellerId: userId, isArchivedBySeller: query.archived },
          { buyerId: userId, isArchivedByBuyer: query.archived },
        ],
      }),
      ...(query.orderId && { orderId: query.orderId }),
      ...(query.productId && { productId: query.productId }),
    };

    const [conversations, total] = await Promise.all([
      this.conversationRepository.findMany(
        where,
        {
          seller: {
            select: {
              id: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              avatar: {
                select: {
                  url: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              avatar: {
                select: {
                  url: true,
                },
              },
            },
          },
          lastMessage: true,
        },
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
    const conversation = await this.conversationRepository.findById(id, {
      seller: {
        select: {
          id: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          avatar: {
            select: {
              url: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          avatar: {
            select: {
              url: true,
            },
          },
        },
      },
      lastMessage: true,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    return this.mapConversationToDto(
      conversation as ConversationWithRelations,
      userId,
    );
  }

  async sendMessage(
    dto: SendMessageDto,
    userId: string,
  ): Promise<MessageResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      return this.sendMessageInternal(dto, userId, tx);
    });
  }

  private async sendMessageInternal(
    dto: SendMessageDto,
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<MessageResponseDto> {
    const conversation = await tx.conversation.findUnique({
      where: { id: dto.conversationId },
      include: {
        seller: true,
        buyer: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    if (conversation.deletedAt) {
      throw new BadRequestException('Conversation has been deleted');
    }

    const isSeller = conversation.sellerId === userId;
    const isBlocked = isSeller
      ? conversation.isBlockedByBuyer
      : conversation.isBlockedBySeller;

    if (isBlocked) {
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
            avatar: {
              select: {
                url: true,
              },
            },
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
        ...(isSeller
          ? { unreadCountByBuyer: { increment: 1 } }
          : { unreadCountBySeller: { increment: 1 } }),
      },
    });

    return this.mapMessageToDto(message);
  }

  async getMessages(
    conversationId: string,
    query: MessageQueryDto,
    userId: string,
  ): Promise<{
    data: MessageResponseDto[];
    hasMore: boolean;
    nextCursor?: string;
  }> {
    const conversation = await this.conversationRepository.findById(
      conversationId,
      {
        seller: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
        lastMessage: true,
      },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
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
        createdAt: {
          lt: cursorCreatedAt,
        },
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
            avatar: {
              select: {
                url: true,
              },
            },
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
    const conversation = await this.conversationRepository.findById(
      dto.conversationId,
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    const result = await this.messageRepository.markAsRead(
      dto.conversationId,
      userId,
      dto.messageIds,
    );

    const isSeller = conversation.sellerId === userId;
    const unreadCount = isSeller
      ? conversation.unreadCountBySeller
      : conversation.unreadCountByBuyer;

    if (unreadCount > 0) {
      await this.conversationRepository.update(
        { id: dto.conversationId },
        {
          ...(isSeller
            ? { unreadCountBySeller: Math.max(0, unreadCount - result.count) }
            : { unreadCountByBuyer: Math.max(0, unreadCount - result.count) }),
        },
      );
    }

    await this.conversationRepository.updateLastSeen(
      dto.conversationId,
      isSeller,
      new Date(),
    );

    return result;
  }

  async updateConversation(
    id: string,
    dto: UpdateConversationDto,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationRepository.findById(id);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    const isSeller = conversation.sellerId === userId;
    const updateData: Prisma.ConversationUpdateInput = {};

    if (dto.isArchived !== undefined) {
      updateData[isSeller ? 'isArchivedBySeller' : 'isArchivedByBuyer'] =
        dto.isArchived;
    }

    if (dto.isBlocked !== undefined) {
      updateData[isSeller ? 'isBlockedBySeller' : 'isBlockedByBuyer'] =
        dto.isBlocked;
    }

    await this.conversationRepository.update({ id }, updateData);

    const updated = await this.conversationRepository.findById(id, {
      seller: {
        select: {
          id: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          avatar: {
            select: {
              url: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          avatar: {
            select: {
              url: true,
            },
          },
        },
      },
      lastMessage: true,
    });

    if (!updated) {
      throw new NotFoundException('Conversation not found');
    }

    return this.mapConversationToDto(
      updated as ConversationWithRelations,
      userId,
    );
  }

  async deleteMessage(
    messageId: string,
    userId: string,
  ): Promise<MessageResponseDto> {
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
            avatar: {
              select: {
                url: true,
              },
            },
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
  ): Promise<MessageResponseDto> {
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
            avatar: {
              select: {
                url: true,
              },
            },
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
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.sellerId !== userId && conversation.buyerId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }

    const isSeller = conversation.sellerId === userId;
    const count = isSeller
      ? conversation.unreadCountBySeller
      : conversation.unreadCountByBuyer;

    return { count };
  }

  async getTotalUnreadCount(userId: string): Promise<{ count: number }> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ sellerId: userId }, { buyerId: userId }],
        deletedAt: null,
      },
      select: {
        sellerId: true,
        buyerId: true,
        unreadCountBySeller: true,
        unreadCountByBuyer: true,
      },
    });

    const total = conversations.reduce((sum, conv) => {
      const isSeller = conv.sellerId === userId;
      return (
        sum + (isSeller ? conv.unreadCountBySeller : conv.unreadCountByBuyer)
      );
    }, 0);

    return { count: total };
  }

  async getStatistics(userId: string): Promise<{
    totalConversations: number;
    unreadMessages: number;
    archivedConversations: number;
    totalMessages: number;
  }> {
    const [conversations, unreadCount, messagesCount] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          OR: [{ sellerId: userId }, { buyerId: userId }],
          deletedAt: null,
        },
        select: {
          sellerId: true,
          buyerId: true,
          isArchivedBySeller: true,
          isArchivedByBuyer: true,
          unreadCountBySeller: true,
          unreadCountByBuyer: true,
        },
      }),
      this.getTotalUnreadCount(userId),
      this.prisma.message.count({
        where: {
          conversation: {
            OR: [{ sellerId: userId }, { buyerId: userId }],
            deletedAt: null,
          },
          deletedAt: null,
        },
      }),
    ]);

    const archived = conversations.filter((conv) => {
      const isSeller = conv.sellerId === userId;
      return isSeller ? conv.isArchivedBySeller : conv.isArchivedByBuyer;
    }).length;

    return {
      totalConversations: conversations.length,
      unreadMessages: unreadCount.count,
      archivedConversations: archived,
      totalMessages: messagesCount,
    };
  }

  private mapConversationToDto(
    conversation: ConversationWithRelations,
    userId: string,
  ): ConversationResponseDto {
    const isSeller = conversation.sellerId === userId;

    return {
      id: conversation.id,
      seller: {
        id: conversation.seller.id,
        phoneNumber: conversation.seller.phoneNumber,
        firstName: conversation.seller.firstName,
        lastName: conversation.seller.lastName,
        avatarUrl: conversation.seller.avatar?.url || null,
      },
      buyer: {
        id: conversation.buyer.id,
        phoneNumber: conversation.buyer.phoneNumber,
        firstName: conversation.buyer.firstName,
        lastName: conversation.buyer.lastName,
        avatarUrl: conversation.buyer.avatar?.url || null,
      },
      orderId: conversation.orderId,
      productId: conversation.productId,
      unreadCount: isSeller
        ? conversation.unreadCountBySeller
        : conversation.unreadCountByBuyer,
      isArchived: isSeller
        ? conversation.isArchivedBySeller
        : conversation.isArchivedByBuyer,
      isBlocked: isSeller
        ? conversation.isBlockedByBuyer
        : conversation.isBlockedBySeller,
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
    };
  }

  private mapMessageToDto(message: MessageWithRelations): MessageResponseDto {
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
