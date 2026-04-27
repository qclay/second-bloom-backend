import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ProductService } from './product.service';

describe('ProductService.getInterestedBuyers', () => {
  type MessageRow = {
    senderId: string;
    createdAt: Date;
    conversationId: string;
    sender: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      phoneCountryCode: string | null;
      phoneNumber: string;
      avatar: { url: string } | null;
    };
  };

  let service: ProductService;

  let prisma: {
    product: {
      findUnique: jest.Mock;
    };
    message: {
      findMany: jest.Mock;
    };
  };

  let presenceService: {
    isOnline: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      product: {
        findUnique: jest.fn(),
      },
      message: {
        findMany: jest.fn(),
      },
    };

    presenceService = {
      isOnline: jest.fn(),
    };

    service = new ProductService(
      {} as never,
      {} as never,
      prisma as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      presenceService as never,
    );
  });

  it('throws NotFoundException when product does not exist', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.getInterestedBuyers('product-1', 'seller-1', UserRole.USER),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.message.findMany).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when product is soft-deleted', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      sellerId: 'seller-1',
      deletedAt: new Date('2026-04-01T00:00:00.000Z'),
    });

    await expect(
      service.getInterestedBuyers('product-1', 'seller-1', UserRole.USER),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.message.findMany).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException for non-owner non-admin non-moderator', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      sellerId: 'seller-1',
      deletedAt: null,
    });

    await expect(
      service.getInterestedBuyers('product-1', 'random-user', UserRole.USER),
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.message.findMany).not.toHaveBeenCalled();
  });

  it('returns empty list when there are no buyer messages', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      sellerId: 'seller-1',
      deletedAt: null,
    });
    prisma.message.findMany.mockResolvedValue([]);

    const result = await service.getInterestedBuyers(
      'product-1',
      'seller-1',
      UserRole.USER,
    );

    expect(result).toEqual({ data: [], total: 0 });
    expect(presenceService.isOnline).not.toHaveBeenCalled();
  });

  it('deduplicates buyers and keeps latest message per buyer', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      sellerId: 'seller-1',
      deletedAt: null,
    });

    const messages: MessageRow[] = [
      {
        senderId: 'buyer-1',
        createdAt: new Date('2026-04-27T12:00:00.000Z'),
        conversationId: 'conv-b1',
        sender: {
          id: 'buyer-1',
          firstName: 'Ali',
          lastName: 'Karimov',
          phoneCountryCode: '+998',
          phoneNumber: '901112233',
          avatar: { url: 'https://cdn/avatar-1.jpg' },
        },
      },
      {
        senderId: 'buyer-2',
        createdAt: new Date('2026-04-27T11:00:00.000Z'),
        conversationId: 'conv-b2',
        sender: {
          id: 'buyer-2',
          firstName: 'Dilshod',
          lastName: null,
          phoneCountryCode: null,
          phoneNumber: '770001122',
          avatar: null,
        },
      },
      {
        senderId: 'buyer-1',
        createdAt: new Date('2026-04-27T10:00:00.000Z'),
        conversationId: 'conv-b1-old',
        sender: {
          id: 'buyer-1',
          firstName: 'Ali',
          lastName: 'Karimov',
          phoneCountryCode: '+998',
          phoneNumber: '901112233',
          avatar: { url: 'https://cdn/avatar-1-old.jpg' },
        },
      },
    ];

    prisma.message.findMany.mockResolvedValue(messages);
    presenceService.isOnline.mockImplementation(async (userId: string) => {
      if (userId === 'buyer-1') return true;
      return false;
    });

    const result = await service.getInterestedBuyers(
      'product-1',
      'seller-1',
      UserRole.USER,
    );

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);

    expect(result.data[0]).toEqual({
      userId: 'buyer-1',
      firstName: 'Ali',
      lastName: 'Karimov',
      phoneNumber: '+998901112233',
      avatarUrl: 'https://cdn/avatar-1.jpg',
      conversationId: 'conv-b1',
      lastMessageAt: '2026-04-27T12:00:00.000Z',
      isOnline: true,
    });

    expect(result.data[1]).toEqual({
      userId: 'buyer-2',
      firstName: 'Dilshod',
      lastName: null,
      phoneNumber: '770001122',
      avatarUrl: null,
      conversationId: 'conv-b2',
      lastMessageAt: '2026-04-27T11:00:00.000Z',
      isOnline: false,
    });

    expect(presenceService.isOnline).toHaveBeenCalledTimes(2);
    expect(presenceService.isOnline).toHaveBeenNthCalledWith(1, 'buyer-1');
    expect(presenceService.isOnline).toHaveBeenNthCalledWith(2, 'buyer-2');
  });

  it('allows admin and moderator to fetch list for non-owned product', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      sellerId: 'seller-1',
      deletedAt: null,
    });
    prisma.message.findMany.mockResolvedValue([]);

    await expect(
      service.getInterestedBuyers('product-1', 'admin-1', UserRole.ADMIN),
    ).resolves.toEqual({ data: [], total: 0 });

    await expect(
      service.getInterestedBuyers(
        'product-1',
        'moderator-1',
        UserRole.MODERATOR,
      ),
    ).resolves.toEqual({ data: [], total: 0 });
  });
});
