import { Test, TestingModule } from '@nestjs/testing';
import { Bid, Prisma, UserRole } from '@prisma/client';
import { BidService } from './bid.service';
import { BidRepository } from './repositories/bid.repository';
import { AuctionRepository } from '../auction/repositories/auction.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AuctionSchedulingService } from '../auction/auction-scheduling.service';

describe('BidService blocked bidder flag', () => {
  let service: BidService;

  let bidRepository: {
    findMany: jest.Mock;
    count: jest.Mock;
  };

  let prisma: {
    userBlock: {
      findMany: jest.Mock;
    };
  };

  const createBid = (id: string, bidderId: string, amount: number): Bid => {
    const now = new Date('2026-04-21T00:00:00.000Z');

    return {
      id,
      auctionId: 'auction-1',
      bidderId,
      amount: new Prisma.Decimal(amount),
      isWinning: false,
      isRetracted: false,
      readByOwnerAt: null,
      rejectedAt: null,
      rejectedBy: null,
      ipAddress: null,
      userAgent: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deletedBy: null,
      isActive: true,
    };
  };

  beforeEach(async () => {
    bidRepository = {
      findMany: jest.fn(),
      count: jest.fn(),
    };

    prisma = {
      userBlock: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidService,
        {
          provide: BidRepository,
          useValue: bidRepository,
        },
        {
          provide: AuctionRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: AuctionSchedulingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BidService>(BidService);
  });

  it('marks blocked bidders for authenticated user even without auctionId', async () => {
    bidRepository.findMany.mockResolvedValue([
      createBid('bid-1', 'bidder-1', 1000),
      createBid('bid-2', 'bidder-2', 1100),
      createBid('bid-3', 'bidder-1', 1200),
    ]);
    bidRepository.count.mockResolvedValue(3);
    prisma.userBlock.findMany.mockResolvedValue([{ blockedId: 'bidder-1' }]);

    const result = await service.findAll(
      {
        page: 1,
        limit: 20,
      },
      {
        id: 'current-user',
        role: UserRole.USER,
      },
    );

    expect(prisma.userBlock.findMany).toHaveBeenCalledTimes(1);

    const callArgs = prisma.userBlock.findMany.mock.calls[0][0] as {
      where: {
        blockerId: string;
        blockedId: { in: string[] };
        isActive: boolean;
      };
    };

    expect(callArgs.where.blockerId).toBe('current-user');
    expect(callArgs.where.isActive).toBe(true);
    expect(callArgs.where.blockedId.in).toEqual(
      expect.arrayContaining(['bidder-1', 'bidder-2']),
    );

    const blockedFlags = result.data.map((bid) => ({
      bidderId: bid.bidderId,
      blocked: bid.isBidderBlockedByCurrentUser,
    }));

    expect(blockedFlags).toEqual([
      { bidderId: 'bidder-1', blocked: true },
      { bidderId: 'bidder-2', blocked: false },
      { bidderId: 'bidder-1', blocked: true },
    ]);
  });

  it('returns false flags and skips userBlock lookup for guests', async () => {
    bidRepository.findMany.mockResolvedValue([
      createBid('bid-1', 'bidder-1', 1000),
      createBid('bid-2', 'bidder-2', 1100),
    ]);
    bidRepository.count.mockResolvedValue(2);

    const result = await service.findAll({ page: 1, limit: 20 });

    expect(prisma.userBlock.findMany).not.toHaveBeenCalled();
    expect(
      result.data.every((bid) => bid.isBidderBlockedByCurrentUser === false),
    ).toBe(true);
  });
});
