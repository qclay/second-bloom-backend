import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationRepository } from './repositories/notification.repository';
import { FIREBASE_SERVICE_TOKEN } from '../../infrastructure/firebase/firebase-service.interface';
import { DeviceTokensService } from '../../redis/device-tokens.service';
import { ConfigService } from '@nestjs/config';
import { PresenceService } from '../../redis/presence.service';
import { NotificationType } from '@prisma/client';

describe('NotificationService Localization', () => {
  let service: NotificationService;
  let prisma: PrismaService;
  let notificationRepository: NotificationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: NotificationRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
          },
        },
        {
          provide: FIREBASE_SERVICE_TOKEN,
          useValue: {
            sendNotificationToMultiple: jest
              .fn()
              .mockResolvedValue({ success: 1, failure: 0 }),
          },
        },
        {
          provide: DeviceTokensService,
          useValue: {
            getTokens: jest.fn().mockResolvedValue(['token-1']),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('production'),
          },
        },
        {
          provide: PresenceService,
          useValue: {
            isUserOnline: jest.fn().mockResolvedValue(false),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationRepository = module.get<NotificationRepository>(
      NotificationRepository,
    );

    (
      service as unknown as { isNotificationEnabled: jest.Mock }
    ).isNotificationEnabled = jest.fn().mockReturnValue(true);
    (
      service as unknown as { getDeliveryModeForType: jest.Mock }
    ).getDeliveryModeForType = jest.fn().mockResolvedValue('ALWAYS');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyOutbid', () => {
    it('should send localized notification in Russian', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        fcmToken: 'token-1',
        language: 'ru',
        notificationPreference: {},
      });

      await service.notifyOutbid({
        userId: 'user-1',
        auctionId: 'auc-1',
        productId: 'prod-1',
        productTitle: 'Кофеварка',
        amount: 5000,
        currency: 'UZS',
      });

      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Вашу ставку перебили',
          message: expect.stringContaining('Кофеварка'),
          type: NotificationType.OUTBID,
        }),
      );
    });

    it('should send localized notification in Uzbek', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        fcmToken: 'token-1',
        language: 'uz',
        notificationPreference: {},
      });

      await service.notifyOutbid({
        userId: 'user-1',
        auctionId: 'auc-1',
        productId: 'prod-1',
        productTitle: 'Qahva mashinasi',
        amount: 5000,
        currency: 'UZS',
      });

      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sizning stavkangiz oshirildi',
          message: expect.stringContaining('Qahva mashinasi'),
          type: NotificationType.OUTBID,
        }),
      );
    });

    it('should send localized notification in English', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        fcmToken: 'token-1',
        language: 'en',
        notificationPreference: {},
      });

      await service.notifyOutbid({
        userId: 'user-1',
        auctionId: 'auc-1',
        productId: 'prod-1',
        productTitle: 'Coffee Machine',
        amount: 5000,
        currency: 'UZS',
      });

      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'You have been outbid',
          message: expect.stringContaining('Coffee Machine'),
          type: NotificationType.OUTBID,
        }),
      );
    });
  });
});
