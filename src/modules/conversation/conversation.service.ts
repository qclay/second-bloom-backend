import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MarkMessagesReadDto } from './dto/mark-messages-read.dto';
import {
  ConversationResponseDto,
  ConversationSellerBuyerDto,
} from './dto/conversation-response.dto';
import { ConversationMessageResponseDto } from './dto/message-response.dto';
import {
  Prisma,
  PrismaClient,
  MessageType,
  DeliveryStatus,
  UserRole,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { ConversationGateway } from './gateways/conversation.gateway';
import { ResolveConversationDto } from './dto/resolve-conversation.dto';
import { ConversationContextType } from './constants/conversation-context.enum';
import {
  t,
  Locale,
  resolveTranslation,
  type TranslationRecord,
} from '../../common/i18n/translation.util';
import { API_MESSAGES } from '../../common/i18n/api-messages.i18n';
import { toISOString } from '../../common/utils/date.util';

const CONVERSATION_INCLUDE = {
  participants: {
    select: {
      id: true,
      conversationId: true,
      userId: true,
      unreadCount: true,
      isArchived: true,
      isBlocked: true,
      lastSeenAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          phoneNumber: true,
          phoneCountryCode: true,
          firstName: true,
          lastName: true,
          avatar: { select: { url: true } },
          isAdministrationChat: true,
        },
      },
    },
  },
  lastMessage: true,
  product: {
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      isCharity: true,
      currency: true,
      auctions: {
        take: 1,
        orderBy: { createdAt: 'desc' as const },
        select: { id: true },
      },
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
    select: {
      id: true,
      auctionId: true,
      orderNumber: true,
      amount: true,
      status: true,
      shippedAt: true,
      deliveredAt: true,
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
        isAdministrationChat?: true;
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
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ConversationGateway))
    private readonly conversationGateway: ConversationGateway,
  ) {}

  private async hasActiveUserBlock(
    userId: string,
    otherUserId: string,
    client: PrismaClient | Prisma.TransactionClient = this.prisma,
  ): Promise<boolean> {
    if (userId === otherUserId) {
      return false;
    }

    const blockClient = client as unknown as {
      userBlock: {
        findFirst: (args: unknown) => Promise<{ id: string } | null>;
      };
    };

    const block = await blockClient.userBlock.findFirst({
      where: {
        isActive: true,
        blockerId: otherUserId,
        blockedId: userId,
      },
      select: { id: true },
    });

    return block !== null;
  }

  private async isUserBlockingOtherUser(
    userId: string,
    otherUserId: string,
    client: PrismaClient | Prisma.TransactionClient = this.prisma,
  ): Promise<boolean> {
    if (userId === otherUserId) {
      return false;
    }

    const blockClient = client as unknown as {
      userBlock: {
        findFirst: (args: unknown) => Promise<{ id: string } | null>;
      };
    };

    const block = await blockClient.userBlock.findFirst({
      where: {
        isActive: true,
        blockerId: userId,
        blockedId: otherUserId,
      },
      select: { id: true },
    });

    return block !== null;
  }

  private async getBlockedUserIds(
    userId: string,
    otherUserIds: string[],
    client: PrismaClient | Prisma.TransactionClient = this.prisma,
  ): Promise<Set<string>> {
    const uniqueOtherUserIds = Array.from(new Set(otherUserIds)).filter(
      (otherUserId) => otherUserId !== userId,
    );

    if (uniqueOtherUserIds.length === 0) {
      return new Set<string>();
    }

    const blockClient = client as unknown as {
      userBlock: {
        findMany: (args: unknown) => Promise<Array<{ blockedId: string }>>;
      };
    };

    const blockedRows = await blockClient.userBlock.findMany({
      where: {
        isActive: true,
        blockerId: userId,
        blockedId: { in: uniqueOtherUserIds },
      },
      select: { blockedId: true },
    });

    return new Set(blockedRows.map((row) => row.blockedId));
  }

  private buildVisibleConversationWhere(
    userId: string,
    archived?: boolean,
  ): Prisma.ConversationWhereInput {
    return {
      participants: {
        some: {
          userId,
          ...(archived !== undefined && { isArchived: archived }),
        },
      },
      deletedAt: null,
    } as Prisma.ConversationWhereInput;
  }

  private async ensureCanSendMessageToParticipant(
    conversation: {
      participants: {
        userId: string;
        user?: { isAdministrationChat?: boolean };
      }[];
    },
    userId: string,
    client: PrismaClient | Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    const otherParticipant = conversation.participants.find(
      (participant) => participant.userId !== userId,
    );

    if (!otherParticipant?.user || otherParticipant.user.isAdministrationChat) {
      return;
    }

    const blocked = await this.hasActiveUserBlock(
      userId,
      otherParticipant.userId,
      client,
    );

    if (blocked) {
      throw new ForbiddenException('You cannot send messages to this user');
    }
  }

  async createConversationForOrder(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        buyerId: true,
        productId: true,
        product: { select: { sellerId: true } },
        deletedAt: true,
      },
    });
    if (!order || order.deletedAt) {
      this.logger.warn(
        `Order ${orderId} not found or deleted, skipping conversation creation`,
      );
      return;
    }
    const sellerId = order.product.sellerId;
    const buyerId = order.buyerId;
    if (sellerId === buyerId) {
      this.logger.warn(
        `Order ${orderId} buyer equals seller, skipping conversation`,
      );
      return;
    }

    const existing = await this.prisma.conversation.findFirst({
      where: { orderId, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (existing) {
      this.logger.debug(`Conversation already exists for order ${orderId}`);
      return;
    }

    const existingForProduct = await this.prisma.conversation.findFirst({
      where: {
        productId: order.productId,
        orderId: null,
        deletedAt: null,
        participants: {
          every: {
            userId: { in: [sellerId, buyerId] },
          },
          some: { userId: sellerId },
        },
        AND: [
          {
            participants: { some: { userId: buyerId } },
          },
        ],
      },
      select: { id: true },
    });

    if (existingForProduct) {
      await this.prisma.conversation.update({
        where: { id: existingForProduct.id },
        data: { orderId },
      });
      this.logger.log(
        `Conversation ${existingForProduct.id} linked to order ${orderId}`,
      );
      return;
    }

    await this.prisma.conversation.create({
      data: {
        orderId,
        productId: order.productId,
        participants: {
          create: [{ userId: sellerId }, { userId: buyerId }],
        },
      },
    });
    this.logger.log(
      `Conversation created for order ${orderId} (seller: ${sellerId}, buyer: ${buyerId})`,
    );
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

    const where = this.buildVisibleConversationWhere(userId, query.archived);

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

    const conversationList = conversations as ConversationWithRelations[];
    const otherUserIds = conversationList
      .map((conversation) =>
        conversation.participants.find((participant) => participant.userId !== userId)
          ?.userId,
      )
      .filter((otherUserId): otherUserId is string => Boolean(otherUserId));
    const blockedUserIds = await this.getBlockedUserIds(userId, otherUserIds);

    return {
      data: await Promise.all(
        conversationList.map((conv) =>
          this.mapConversationToDto(conv, userId, {
            blocked: blockedUserIds.has(
              conv.participants.find(
                (participant) => participant.userId !== userId,
              )?.userId ?? '',
            ),
          }),
        ),
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

  async resolveConversation(
    dto: ResolveConversationDto,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const { context, productId, orderId, targetUserId, metadata } = dto;

    if (context === ConversationContextType.ORDER) {
      if (!orderId)
        throw new BadRequestException('orderId is required for ORDER context');
      return this.resolveOrderConversation(orderId, userId);
    }

    if (
      context === ConversationContextType.PRODUCT ||
      context === ConversationContextType.AUCTION_BID
    ) {
      if (!productId)
        throw new BadRequestException('productId is required for this context');
      return this.getOrCreateConversationByProduct(
        productId,
        userId,
        targetUserId,
        metadata,
      );
    }

    if (context === ConversationContextType.SUPPORT) {
      const { conversationId } =
        await this.getOrCreateAdministrationConversation(userId);
      if (!conversationId)
        throw new BadRequestException('Could not resolve administration chat');
      return this.getConversationById(conversationId, userId);
    }

    throw new BadRequestException('Unsupported conversation context');
  }

  private async resolveOrderConversation(
    orderId: string,
    userId: string,
  ): Promise<ConversationResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.buyerId !== userId && order.product.sellerId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    const existing = await this.prisma.conversation.findFirst({
      where: { orderId, deletedAt: null },
      include: CONVERSATION_INCLUDE,
    });

    if (existing) {
      return this.mapConversationToDto(
        existing as ConversationWithRelations,
        userId,
      );
    }

    const created = await this.prisma.conversation.create({
      data: {
        orderId,
        productId: order.productId,
        participants: {
          create: [
            { userId: order.buyerId },
            { userId: order.product.sellerId },
          ],
        },
      },
      include: CONVERSATION_INCLUDE,
    });

    return this.mapConversationToDto(
      created as ConversationWithRelations,
      userId,
    );
  }

  async getOrCreateConversationByProduct(
    productId: string,
    userId: string,
    targetUserId?: string,
    metadata?: Prisma.JsonObject,
  ): Promise<ConversationResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const otherParticipantId = targetUserId || product.sellerId;

    if (otherParticipantId === userId) {
      throw new BadRequestException(
        'Cannot create conversation with yourself about this product',
      );
    }

    if (
      userId !== product.sellerId &&
      otherParticipantId !== product.sellerId
    ) {
      throw new BadRequestException(
        'One of the conversation participants must be the product seller',
      );
    }

    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        productId,
        deletedAt: null,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: CONVERSATION_INCLUDE,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingConversation) {
      const hasBothParticipants =
        existingConversation.participants.some((p) => p.userId === userId) &&
        existingConversation.participants.some(
          (p) => p.userId === otherParticipantId,
        );
      if (hasBothParticipants) {
        return this.mapConversationToDto(
          existingConversation as ConversationWithRelations,
          userId,
        );
      }
    }

    const createdConversation = await this.prisma.conversation.create({
      data: {
        product: {
          connect: { id: productId },
        },
        participants: {
          create: [{ userId }, { userId: otherParticipantId }],
        },
        ...(metadata ? { metadata } : {}),
      },
      include: CONVERSATION_INCLUDE,
    });

    this.logger.log(
      `Conversation created for product ${productId} between ${userId} and ${otherParticipantId} (Contextual)`,
    );

    return this.mapConversationToDto(
      createdConversation as ConversationWithRelations,
      userId,
    );
  }

  async sendMessage(
    dto: SendMessageDto,
    userId: string,
  ): Promise<ConversationMessageResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      return this.sendMessageInternal(dto, userId, tx);
    });
  }

  private async sendMessageInternal(
    dto: SendMessageDto,
    userId: string,
    tx: Prisma.TransactionClient,
  ): Promise<ConversationMessageResponseDto> {
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

    if (myParticipant.isBlocked) {
      throw new ForbiddenException('You have blocked this conversation');
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== userId,
    );
    if (otherParticipant?.isBlocked) {
      throw new ForbiddenException('You cannot send messages to this user');
    }

    if (!conversation.isActive) {
      throw new BadRequestException(
        'Conversation is inactive (order in DELIVERY status or closed)',
      );
    }

    await this.ensureCanSendMessageToParticipant(conversation, userId, tx);

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

    if (dto.messageType === MessageType.VIDEO_NOTE) {
      if (!dto.fileId) {
        throw new BadRequestException('Video notes require a file attachment');
      }
      if (dto.duration && dto.duration > 15) {
        throw new BadRequestException('Video note cannot exceed 15 seconds');
      }
    }

    if (
      !dto.content &&
      !(
        [
          MessageType.IMAGE,
          MessageType.FILE,
          MessageType.VIDEO_NOTE,
          MessageType.VOICE,
        ] as MessageType[]
      ).includes(dto.messageType || MessageType.TEXT)
    ) {
      throw new BadRequestException('Content is required for text messages');
    }

    let metadata: Prisma.InputJsonValue | undefined = undefined;
    if (dto.duration !== undefined) {
      metadata = { duration: dto.duration };
    }

    const message = await tx.message.create({
      data: {
        conversation: { connect: { id: dto.conversationId } },
        sender: { connect: { id: userId } },
        messageType: dto.messageType || MessageType.TEXT,
        content: dto.content ?? '',
        ...(dto.fileId && { file: { connect: { id: dto.fileId } } }),
        ...(dto.replyToMessageId && {
          replyTo: { connect: { id: dto.replyToMessageId } },
        }),
        ...(metadata && { metadata }),
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
            isAdministrationChat: true,
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

    if (conversation.orderId) {
      const order = await tx.order.findUnique({
        where: { id: conversation.orderId },
        select: { status: true, deliveredAt: true },
      });
      if (
        order &&
        (order.status === 'DELIVERED' || order.deliveredAt != null)
      ) {
        await tx.conversation.update({
          where: { id: dto.conversationId },
          data: { isActive: false },
        });
      }
    }

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
    data: ConversationMessageResponseDto[];
    hasMore: boolean;
    nextCursor?: string;
  }> {
    const conversation = await this.conversationRepository.findById(
      conversationId,
      {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                isAdministrationChat: true,
              },
            },
          },
        },
      },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const conv = conversation as unknown as {
      participants: {
        userId: string;
        user?: { isAdministrationChat?: boolean };
      }[];
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
            isAdministrationChat: true,
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
      const newUnreadCount =
        dto.messageIds && dto.messageIds.length > 0
          ? Math.max(0, participant.unreadCount - result.count)
          : 0;

      await this.prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: {
          unreadCount: newUnreadCount,
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
  ): Promise<ConversationMessageResponseDto> {
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

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { language: true },
    });
    const lang = (user?.language as Locale) || 'uz';

    await this.messageRepository.update(
      { id: messageId },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        content: t(API_MESSAGES, 'This message was deleted', {}, lang),
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
  ): Promise<ConversationMessageResponseDto> {
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

  async searchMessages(
    userId: string,
    q: string,
    limit = 20,
  ): Promise<{
    data: {
      message: ConversationMessageResponseDto;
      conversationTitle: string;
      unreadCount: number;
    }[];
  }> {
    const query = (q || '').trim();
    if (!query) {
      return { data: [] };
    }

    const conversationIds = await this.getConversationIds(userId);
    if (conversationIds.length === 0) {
      return { data: [] };
    }

    const take = Math.min(Math.max(1, limit), 50);
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
        content: { contains: query, mode: 'insensitive' },
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            avatar: { select: { url: true } },
            isAdministrationChat: true,
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
        conversation: {
          select: {
            id: true,
            participants: {
              select: {
                userId: true,
                unreadCount: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    type ConversationParticipantSummary = {
      userId: string;
      unreadCount: number;
      user: {
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string;
      };
    };

    const data = messages.map((msg) => {
      const conv = msg.conversation as {
        participants: ConversationParticipantSummary[];
      };
      const other = conv.participants.find((p) => p.userId !== userId);
      const conversationTitle = other
        ? [other.user.firstName, other.user.lastName]
            .filter(Boolean)
            .join(' ') ||
          other.user.phoneNumber ||
          'Conversation'
        : 'Conversation';
      const participant = conv.participants.find((p) => p.userId === userId);
      const unreadCount = Number(participant?.unreadCount ?? 0);

      const rest = { ...msg };
      delete (rest as { conversation?: unknown }).conversation;

      return {
        message: this.mapMessageToDto(rest as MessageWithRelations),
        conversationTitle,
        unreadCount,
      };
    });

    return { data };
  }

  async getConversationIds(userId: string): Promise<string[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: this.buildVisibleConversationWhere(userId),
      select: { id: true },
    });
    return conversations.map((conversation) => conversation.id);
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

  private async mapConversationToDto(
    conversation: ConversationWithRelations,
    userId: string,
    options?: { blocked?: boolean },
  ): Promise<ConversationResponseDto> {
    const myParticipant = conversation.participants.find(
      (p) => p.userId === userId,
    );
    const otherParticipantId =
      conversation.participants.find((p) => p.userId !== userId)?.userId ?? null;
    const blocked =
      options?.blocked ??
      (otherParticipantId
        ? await this.isUserBlockingOtherUser(userId, otherParticipantId)
        : false);

    const convForRole = conversation as ConversationWithRelations & {
      product?: { seller?: { id: string } };
      order?: { buyer?: { id: string } };
    };
    const sellerIdForRole = convForRole.product?.seller?.id ?? null;
    const buyerIdForRole = convForRole.order?.buyer?.id ?? null;

    const participants = conversation.participants.map((p) => {
      const u = p.user;
      const phoneNumber = u.phoneCountryCode
        ? `${u.phoneCountryCode}${u.phoneNumber}`
        : u.phoneNumber;
      let role: 'seller' | 'consumer' | null = null;
      if (sellerIdForRole && buyerIdForRole) {
        if (p.userId === sellerIdForRole) role = 'seller';
        else if (p.userId === buyerIdForRole) role = 'consumer';
      }
      const isAdminChat =
        (u as { isAdministrationChat?: boolean })?.isAdministrationChat ??
        false;
      return {
        userId: u.id,
        username: u.username ?? null,
        phoneNumber,
        firstName: u.firstName,
        lastName: u.lastName,
        avatarUrl: u.avatar?.url || null,
        ...(isAdminChat && { isAdministrationChat: true }),
        ...(role && { role }),
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
        isCharity: boolean;
        currency: string;
        auctions?: { id: string }[];
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
        auctionId: string | null;
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
      const productAuctionId =
        conv.order?.auctionId ?? conv.product?.auctions?.[0]?.id ?? null;
      pinnedProduct = {
        id: p.id,
        slug: p.slug,
        title:
          resolveTranslation(p.title as Record<string, string>, null) ?? '',
        price,
        isCharity: p.isCharity,
        currency: p.currency,
        imageUrl: p.images?.[0]?.file?.url ?? null,
        auctionId: productAuctionId,
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
        auctionId: o.auctionId,
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
      flowerImageUrl: conv.product?.images?.[0]?.file?.url ?? null,
      participants,
      unreadCount: myParticipant?.unreadCount ?? 0,
      isArchived: myParticipant?.isArchived ?? false,
      blocked: !!conversation.participants.find(
        (p) => p.userId !== userId && p.isBlocked
      ),
      isBlocked: myParticipant?.isBlocked ?? false,
      isActive: conversation.isActive,
      lastMessageAt: toISOString(conversation.lastMessageAt),
      lastMessage: conversation.lastMessage
        ? {
            id: conversation.lastMessage.id,
            content: conversation.lastMessage.content,
            messageType: conversation.lastMessage.messageType,
            createdAt: toISOString(conversation.lastMessage.createdAt) ?? '',
            isRead: conversation.lastMessage.isRead,
            metadata:
              (
                conversation.lastMessage as {
                  metadata?: Record<string, unknown> | null;
                }
              ).metadata ?? null,
          }
        : null,
      createdAt: toISOString(conversation.createdAt) ?? '',
      updatedAt: toISOString(conversation.updatedAt) ?? '',
      seller: seller ?? null,
      buyer: buyer ?? null,
      pinnedProduct: pinnedProduct ?? null,
      pinnedOrder: pinnedOrder ?? null,
    };
  }

  private async getAdministrationUserId(): Promise<string | null> {
    const dedicated = await this.prisma.user.findFirst({
      where: { isAdministrationChat: true, deletedAt: null },
      select: { id: true },
    });
    if (dedicated) return dedicated.id;
    const fromEnv = this.configService.get<string>('ADMIN_USER_ID');
    if (fromEnv) return fromEnv;
    const admin = await this.prisma.user.findFirst({
      where: { role: UserRole.ADMIN, deletedAt: null },
      select: { id: true },
    });
    return admin?.id ?? null;
  }

  private static readonly WELCOME_MESSAGES: TranslationRecord = {
    en: 'Welcome to Second Bloom!',
    ru: 'Добро пожаловать в Second Bloom!',
    uz: 'Second Bloom ga xush kelibsiz!',
  };

  async getOrCreateAdministrationConversation(
    userId: string,
  ): Promise<{ conversationId: string | null; created: boolean }> {
    const adminUserId = await this.getAdministrationUserId();
    if (!adminUserId) {
      this.logger.warn(
        'No administration user configured (ADMIN_USER_ID or any ADMIN user). Skipping administration conversation.',
      );
      throw new BadRequestException(
        'Administration chat is not configured. Set ADMIN_USER_ID in environment.',
      );
    }
    if (adminUserId === userId) return { conversationId: null, created: false };

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.conversation.findFirst({
        where: {
          deletedAt: null,
          productId: null,
          orderId: null,
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: adminUserId } } },
          ],
        },
        select: { id: true },
      });
      if (existing) return { conversationId: existing.id, created: false };
      const created = await tx.conversation.create({
        data: {
          participants: {
            create: [{ userId }, { userId: adminUserId }],
          },
        },
        select: { id: true },
      });
      return { conversationId: created.id, created: true };
    });
  }

  async ensureAdministrationConversationAndSendWelcome(
    userId: string,
    preferredLanguage?: string | null,
  ): Promise<void> {
    try {
      const { conversationId, created } =
        await this.getOrCreateAdministrationConversation(userId);
      if (!conversationId || !created) return;
      const adminUserId = await this.getAdministrationUserId();
      if (!adminUserId) return;
      const content =
        resolveTranslation(
          ConversationService.WELCOME_MESSAGES,
          preferredLanguage ?? undefined,
        ) ?? ConversationService.WELCOME_MESSAGES.en!;
      await this.sendMessageAsSender(
        conversationId,
        adminUserId,
        content,
        undefined,
      );
    } catch (err) {
      this.logger.warn(
        'Failed to ensure administration conversation or send welcome',
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  async sendMessageAsSender(
    conversationId: string,
    senderId: string,
    content: string,
    metadata?: Record<string, unknown>,
    messageType: MessageType = MessageType.TEXT,
  ): Promise<void> {
    const newMessage = await this.prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: { select: { userId: true } } },
      });
      if (!conv) throw new NotFoundException('Conversation not found');
      const isParticipant = conv.participants.some(
        (p: { userId: string }) => p.userId === senderId,
      );
      if (!isParticipant)
        throw new ForbiddenException('Sender is not a participant');
      const other = conv.participants.find((p) => p.userId !== senderId);
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          messageType,
          content,
          deliveryStatus: DeliveryStatus.SENT,
          ...(metadata && { metadata: metadata as Prisma.InputJsonValue }),
        },
        include: {
          sender: {
            select: {
              id: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              avatar: { select: { url: true } },
              isAdministrationChat: true,
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
        where: { id: conversationId },
        data: {
          lastMessageId: message.id,
          lastMessageAt: message.createdAt,
        },
      });
      if (other) {
        await tx.conversationParticipant.updateMany({
          where: { conversationId, userId: other.userId },
          data: { unreadCount: { increment: 1 } },
        });
      }
      return message;
    });

    const mappedDto = this.mapMessageToDto(
      newMessage as unknown as MessageWithRelations,
    );
    this.conversationGateway.broadcastNewMessage?.(conversationId, mappedDto);
  }

  async notifyProductModerationRejected(
    sellerId: string,
    product: {
      id: string;
      title?: string;
      imageUrl?: string | null;
      price?: number;
      currency?: string;
    },
    reason: string,
  ): Promise<void> {
    const adminUserId = await this.getAdministrationUserId();
    if (!adminUserId || adminUserId === sellerId) return;
    try {
      const seller = await this.prisma.user.findUnique({
        where: { id: sellerId },
        select: { language: true },
      });
      const lang = (seller?.language as Locale) || 'uz';

      const { conversationId } =
        await this.getOrCreateAdministrationConversation(sellerId);
      if (!conversationId) return;

      const resolvedReason =
        reason === 'Not specified'
          ? t(API_MESSAGES, 'Not specified', {}, lang)
          : reason;

      const content = t(
        API_MESSAGES,
        'Your product did not pass moderation. Reason: {{reason}}',
        { reason: resolvedReason },
        lang,
      );
      const metadata = {
        type: 'MODERATION_REJECT',
        productId: product.id,
        reason,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        currency: product.currency,
      };
      await this.sendMessageAsSender(
        conversationId,
        adminUserId,
        content,
        metadata,
      );
      await this.notificationService.notifyNewMessage({
        recipientId: sellerId,
        conversationId,
        senderName: 'SECOND BLOOM Administration',
      });
    } catch (err) {
      this.logger.error(
        'Failed to send moderation rejection message',
        err instanceof Error ? err.stack : err,
      );
    }
  }

  async deactivateConversationsForOrder(orderId: string): Promise<void> {
    const result = await this.prisma.conversation.updateMany({
      where: { orderId, deletedAt: null, isActive: true },
      data: { isActive: false },
    });
    if (result.count > 0) {
      this.logger.log(
        `Deactivated ${result.count} conversation(s) for completed delivery order ${orderId}`,
      );
    }
  }

  async deactivateConversationByProductId(productId: string): Promise<void> {
    const result = await this.prisma.conversation.updateMany({
      where: { productId, deletedAt: null, isActive: true },
      data: { isActive: false },
    });
    if (result.count > 0) {
      this.logger.log(
        `Deactivated ${result.count} conversation(s) for product ${productId}`,
      );
    }
  }

  async deactivateOrderConversationsSweep(
    batchSize = 100,
  ): Promise<{ deactivatedCount: number; hasMore: boolean }> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        orderId: { not: null },
        deletedAt: null,
        isActive: true,
        order: { deletedAt: null },
      },
      select: {
        id: true,
        lastMessageAt: true,
        order: { select: { status: true, deliveredAt: true } },
      },
      take: batchSize,
    });

    if (conversations.length === 0) {
      return { deactivatedCount: 0, hasMore: false };
    }

    const idsToDeactivate = conversations
      .filter((c) => {
        const order = c.order;
        if (!order) return false;
        if (order.status === 'DELIVERED') return true;
        if (
          order.deliveredAt &&
          c.lastMessageAt &&
          c.lastMessageAt > order.deliveredAt
        ) {
          return true;
        }
        return false;
      })
      .map((c) => c.id);

    let deactivatedCount = 0;
    if (idsToDeactivate.length > 0) {
      const result = await this.prisma.conversation.updateMany({
        where: { id: { in: idsToDeactivate } },
        data: { isActive: false },
      });
      deactivatedCount = result.count;
      this.logger.log(
        `Deactivated ${deactivatedCount} order conversation(s) (sweep)`,
      );
    }

    return {
      deactivatedCount,
      hasMore: conversations.length === batchSize,
    };
  }

  private mapMessageToDto(
    message: MessageWithRelations,
  ): ConversationMessageResponseDto {
    const sender = message.sender as typeof message.sender & {
      isAdministrationChat?: boolean;
    };
    return {
      id: message.id,
      conversationId: message.conversationId,
      sender: {
        id: sender.id,
        phoneNumber: sender.phoneNumber,
        firstName: sender.firstName,
        lastName: sender.lastName,
        avatarUrl: sender.avatar?.url || null,
        ...(sender.isAdministrationChat ? { isAdministrationChat: true } : {}),
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
      readAt: toISOString(message.readAt),
      isEdited: message.isEdited,
      editedAt: toISOString(message.editedAt),
      isDeleted: message.isDeleted,
      createdAt: toISOString(message.createdAt) ?? '',
      updatedAt: toISOString(message.updatedAt) ?? '',
      metadata:
        (message as { metadata?: Record<string, unknown> | null }).metadata ??
        null,
    };
  }
}
