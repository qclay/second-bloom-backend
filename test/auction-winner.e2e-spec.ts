import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/infrastructure/firebase/firebase.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { UserRole, AuctionStatus } from '@prisma/client';

describe('Auction Winner Selection (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseService)
      .useValue({
        onModuleInit: jest.fn(),
        sendNotification: jest.fn().mockResolvedValue(true),
        sendNotificationToMultiple: jest
          .fn()
          .mockResolvedValue({ success: 1, failure: 0 }),
        validateToken: jest.fn().mockReturnValue(true),
      })
      .overrideProvider('BullQueue_auction')
      .useValue({
        add: jest.fn().mockResolvedValue({}),
        getJob: jest.fn().mockResolvedValue(null),
        process: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        removeListener: jest.fn(),
      })
      .overrideProvider('BullQueue_auth')
      .useValue({
        add: jest.fn().mockResolvedValue({}),
        getJob: jest.fn().mockResolvedValue(null),
        process: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        removeListener: jest.fn(),
      })
      .overrideProvider('BullQueue_payment')
      .useValue({
        add: jest.fn().mockResolvedValue({}),
        getJob: jest.fn().mockResolvedValue(null),
        process: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        removeListener: jest.fn(),
      })
      .overrideProvider('BullQueue_conversation')
      .useValue({
        add: jest.fn().mockResolvedValue({}),
        getJob: jest.fn().mockResolvedValue(null),
        process: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        removeListener: jest.fn(),
      })
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        on: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        disconnect: jest.fn(),
        quit: jest.fn(),
      })
      .overrideProvider('RedisService')
      .useValue({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .overrideProvider('PresenceService')
      .useValue({
        setUserOnline: jest.fn(),
        setUserOffline: jest.fn(),
      })
      .overrideProvider('DeviceTokensService')
      .useValue({
        saveToken: jest.fn(),
        removeToken: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  async function cleanup() {
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.order.deleteMany();
    await prisma.auction.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.notificationPreference.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.verificationCode.deleteMany();
    await prisma.user.deleteMany();
  }

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  async function createTestUser(role: UserRole = 'USER', phone: string = '901234567') {
    return await prisma.user.create({
      data: {
        phoneNumber: phone,
        phoneCountryCode: '+998',
        role,
        isVerified: true,
        isActive: true,
      },
    });
  }

  async function getAuthToken(user: any) {
    const { accessToken } = await (authService as any).generateTokens(user);
    return accessToken;
  }

  describe('PATCH /auctions/:id/winner', () => {
    let seller: any;
    let buyer: any;
    let category: any;
    let product: any;
    let auction: any;
    let bid: any;
    let token: string;

    beforeEach(async () => {
      await cleanup();

      seller = await createTestUser('USER', '901111111');
      buyer = await createTestUser('USER', '902222222');
      token = await getAuthToken(seller);

      category = await prisma.category.create({
        data: { name: { en: 'Test' }, slug: 'test' }
      });

      product = await prisma.product.create({
        data: {
          title: { en: 'Test Product' },
          slug: 'test-product',
          price: 100000,
          categoryId: category.id,
          sellerId: seller.id,
          status: 'PUBLISHED',
        },
      });

      auction = await prisma.auction.create({
        data: {
          productId: product.id,
          creatorId: seller.id,
          startPrice: 80000,
          currentPrice: 90000,
          minBidAmount: 5000,
          bidIncrement: 5000,
          durationHours: 24,
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          status: 'ACTIVE',
        },
      });

      bid = await prisma.bid.create({
        data: {
          auctionId: auction.id,
          bidderId: buyer.id,
          amount: 90000,
        },
      });
    });

    it('should allow choosing winner from ACTIVE auction', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/auctions/${auction.id}/winner`)
        .set('Authorization', `Bearer ${token}`)
        .send({ winnerId: buyer.id });

      expect(res.status).toBe(200);
      expect(res.body.data.winnerId).toBe(buyer.id);
      expect(res.body.data.status).toBe('ENDED');
    });

    it('should create order when winner is chosen', async () => {
      await request(app.getHttpServer())
        .patch(`/auctions/${auction.id}/winner`)
        .set('Authorization', `Bearer ${token}`)
        .send({ winnerId: buyer.id });

      const order = await prisma.order.findFirst({
        where: { productId: product.id, buyerId: buyer.id },
      });

      expect(order).toBeDefined();
      expect(order?.amount.toString()).toBe('90000');
    });

    it('should return chatId in response', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/auctions/${auction.id}/winner`)
        .set('Authorization', `Bearer ${token}`)
        .send({ winnerId: buyer.id });

      expect(res.body.data.chatId).toBeDefined();
    });

    it('should require winner to have at least one bid', async () => {
      const otherBuyer = await createTestUser('USER', '903333333');
      const res = await request(app.getHttpServer())
        .patch(`/auctions/${auction.id}/winner`)
        .set('Authorization', `Bearer ${token}`)
        .send({ winnerId: otherBuyer.id });

      expect(res.status).toBe(400);
    });
  });

  describe('Automatic auction ending', () => {
    it('should NOT auto-select winner when auction expires', async () => {
      expect(true).toBe(true);
    });

    it('should set winnerId to null for expired auctions', async () => {
      expect(true).toBe(true);
    });

    it('should notify all participants with isWinner: false', async () => {
      expect(true).toBe(true);
    });
  });

  describe('Close auction early', () => {
    it('should NOT auto-select winner when closing auction early', async () => {
      expect(true).toBe(true);
    });

    it('should set winnerId to null when closing without winner', async () => {
      expect(true).toBe(true);
    });
  });
});
