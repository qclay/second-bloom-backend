import { Test, TestingModule } from '@nestjs/testing';
import { ConversationGateway } from './conversation.gateway';
import { ConversationService } from '../conversation.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsRateLimitGuard } from '../../../common/guards/ws-rate-limit.guard';
import { CONVERSATION_EVENTS } from '../constants/conversation-events.constants';
import { ConversationMessageResponseDto } from '../dto/message-response.dto';
import { PrismaService } from '../../../prisma/prisma.service';

type MockSocketServer = {
  to: jest.Mock<MockSocketServer, [string]>;
  emit: jest.Mock<void, [string, unknown]>;
};

describe('ConversationGateway', () => {
  let gateway: ConversationGateway;
  let mockServer: MockSocketServer;

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationGateway,
        {
          provide: ConversationService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: WsRateLimitGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    gateway = module.get<ConversationGateway>(ConversationGateway);
    gateway.server = mockServer as unknown as ConversationGateway['server'];
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('broadcastNewMessage', () => {
    it('should emit NEW_MESSAGE to the corresponding conversation room', () => {
      const conversationId = 'conv-123';
      const mockDto = {
        id: 'msg-456',
        conversationId,
        content: 'System banner test',
        messageType: 'SYSTEM',
        metadata: { type: 'ORDER_CREATED', orderId: 'ord-123' },
      };

      gateway.broadcastNewMessage(
        conversationId,
        mockDto as unknown as ConversationMessageResponseDto,
      );

      expect(mockServer.to).toHaveBeenCalledWith(
        `conversation:${conversationId}`,
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        CONVERSATION_EVENTS.NEW_MESSAGE,
        mockDto,
      );
    });
  });
});
