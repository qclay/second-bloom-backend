import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { ConversationGateway } from './gateways/conversation.gateway';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageType, DeliveryStatus } from '@prisma/client';

describe('ConversationService (Recent Fixes)', () => {
  let service: ConversationService;
  let conversationRepository: Partial<
    Record<keyof ConversationRepository, jest.Mock>
  >;
  let messageRepository: Partial<Record<keyof MessageRepository, jest.Mock>>;
  let notificationService: Partial<
    Record<keyof NotificationService, jest.Mock>
  >;
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>;
  let conversationGateway: Partial<
    Record<keyof ConversationGateway, jest.Mock>
  >;
  type MockTx = {
    conversation: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    message: {
      create: jest.Mock;
    };
    userBlock: {
      findFirst: jest.Mock;
    };
    conversationParticipant: {
      updateMany: jest.Mock;
    };
  };

  let mockPrismaClient: { $transaction: jest.Mock };
  let mockTx: MockTx;

  beforeEach(async () => {
    conversationRepository = {
      findById: jest.fn(),
    };
    messageRepository = {};
    notificationService = {};
    configService = {
      get: jest.fn(),
    };
    conversationGateway = {
      broadcastNewMessage: jest.fn(),
    };

    mockTx = {
      conversation: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      message: {
        create: jest.fn(),
      },
      userBlock: {
        findFirst: jest.fn(),
      },
      conversationParticipant: {
        updateMany: jest.fn(),
      },
    };

    mockPrismaClient = {
      $transaction: jest.fn((cb) => cb(mockTx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: ConversationRepository, useValue: conversationRepository },
        { provide: MessageRepository, useValue: messageRepository },
        { provide: PrismaService, useValue: mockPrismaClient },
        { provide: NotificationService, useValue: notificationService },
        { provide: ConfigService, useValue: configService },
        { provide: ConversationGateway, useValue: conversationGateway },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  describe('sendMessageAsSender', () => {
    const conversationId = 'conv-123';
    const senderId = 'seller-123';
    const buyerId = 'buyer-456';
    const content = 'New Order!';
    const metadata = { type: 'ORDER_CREATED', orderId: 'order-123' };

    it('should create banner, broadcast via gateway, and update conversation/participants', async () => {
      const mockConversation = {
        id: conversationId,
        participants: [{ userId: senderId }, { userId: buyerId }],
      };

      const mockedNewMessage = {
        id: 'msg-999',
        conversationId,
        senderId,
        messageType: MessageType.SYSTEM,
        content,
        deliveryStatus: DeliveryStatus.SENT,
        createdAt: new Date('2026-03-18T10:00:00.000Z'),
        updatedAt: new Date('2026-03-18T10:00:00.000Z'),
        isRead: false,
        isEdited: false,
        isDeleted: false,
        metadata,
        sender: {
          id: senderId,
          phoneNumber: '+998901234567',
          firstName: 'Seller 1',
          lastName: '',
          avatar: null,
        },
        file: null,
      };

      mockTx.conversation.findUnique.mockResolvedValue(mockConversation);
      mockTx.message.create.mockResolvedValue(mockedNewMessage);

      await service.sendMessageAsSender(
        conversationId,
        senderId,
        content,
        metadata,
        MessageType.SYSTEM,
      );

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(mockTx.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: conversationId },
        include: { participants: { select: { userId: true } } },
      });

      expect(mockTx.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            conversationId,
            senderId,
            messageType: MessageType.SYSTEM,
            content,
            deliveryStatus: DeliveryStatus.SENT,
            metadata,
          },
          include: expect.any(Object),
        }),
      );

      expect(mockTx.conversation.update).toHaveBeenCalledWith({
        where: { id: conversationId },
        data: {
          lastMessageId: mockedNewMessage.id,
          lastMessageAt: mockedNewMessage.createdAt,
        },
      });

      expect(mockTx.conversationParticipant.updateMany).toHaveBeenCalledWith({
        where: { conversationId, userId: buyerId },
        data: { unreadCount: { increment: 1 } },
      });

      expect(conversationGateway.broadcastNewMessage).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          id: mockedNewMessage.id,
          content: mockedNewMessage.content,
          metadata: mockedNewMessage.metadata,
        }),
      );
    });

    it('should throw ForbiddenException if sender is not participant', async () => {
      mockTx.conversation.findUnique.mockResolvedValue({
        id: conversationId,
        participants: [{ userId: buyerId }],
      });

      await expect(
        service.sendMessageAsSender(
          conversationId,
          senderId,
          content,
          metadata,
          MessageType.SYSTEM,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      mockTx.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessageAsSender(
          conversationId,
          senderId,
          content,
          metadata,
          MessageType.SYSTEM,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when the other participant blocked the sender', async () => {
      mockTx.conversation.findUnique.mockResolvedValue({
        id: conversationId,
        deletedAt: null,
        isActive: true,
        participants: [
          {
            userId: senderId,
            user: { id: senderId, isAdministrationChat: false },
          },
          {
            userId: buyerId,
            user: { id: buyerId, isAdministrationChat: false },
          },
        ],
      });
      mockTx.userBlock.findFirst.mockResolvedValue({ id: 'block-1' });

      await expect(
        service.sendMessage(
          {
            conversationId,
            content,
          } as never,
          senderId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('mapConversationToDto integration', () => {
    it('should correctly map metadata in lastMessage for ConversationResponseDto', async () => {
      const authUserId = 'user-1';
      const mockDbConversation = {
        id: 'conv-abc',
        participants: [
          {
            userId: authUserId,
            user: {
              id: authUserId,
              phoneNumber: '1',
              firstName: 'Me',
              avatar: null,
            },
          },
        ],
        createdAt: new Date('2026-03-18T10:00:00.000Z'),
        updatedAt: new Date('2026-03-18T10:00:00.000Z'),
        isActive: true,
        lastMessageAt: new Date('2026-03-18T10:05:00.000Z'),
        lastMessage: {
          id: 'msg-999',
          content: 'New order #123456',
          messageType: MessageType.SYSTEM,
          createdAt: new Date('2026-03-18T10:05:00.000Z'),
          isRead: false,
          metadata: { type: 'ORDER_CREATED', orderId: 'ord-xyz' },
        },
      };

      conversationRepository.findById!.mockResolvedValue(mockDbConversation);

      const result = await service.getConversationById('conv-abc', authUserId);

      expect(result.lastMessage).toBeDefined();
      expect(result.lastMessage?.metadata).toEqual({
        type: 'ORDER_CREATED',
        orderId: 'ord-xyz',
      });
      expect(result.lastMessage?.messageType).toBe('SYSTEM');
    });
  });
});
