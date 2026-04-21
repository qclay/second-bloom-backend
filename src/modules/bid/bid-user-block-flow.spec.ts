import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import { BidService } from './bid.service';
import { BidRepository } from './repositories/bid.repository';
import { AuctionRepository } from '../auction/repositories/auction.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { AuctionSchedulingService } from '../auction/auction-scheduling.service';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/repositories/user.repository';
import { FIREBASE_SERVICE_TOKEN } from '../../infrastructure/firebase/firebase-service.interface';
import { OtpService } from '../auth/services/otp.service';
import { DeviceTokensService } from '../../redis/device-tokens.service';

type UserBlockRow = {
  id: string;
  blockerId: string;
  blockedId: string;
  isActive: boolean;
};

describe('Bid/User block flow integration unit', () => {
  let bidService: BidService;
  let userService: UserService;

  const userBlocks: UserBlockRow[] = [];

  const userRepository = {
    findById: jest.fn(async (id: string) => ({ id, deletedAt: null })),
  };

  const bidRepository = {
    findMany: jest.fn(),
    count: jest.fn(),
  };

  const prisma = {
    userBlock: {
      upsert: jest.fn(async (args: {
        where: { blockerId_blockedId: { blockerId: string; blockedId: string } };
        create: { blockerId: string; blockedId: string; isActive: boolean };
        update: { isActive: boolean };
      }) => {
        const {
          blockerId_blockedId: { blockerId, blockedId },
        } = args.where;
        const existing = userBlocks.find(
          (row) => row.blockerId === blockerId && row.blockedId === blockedId,
        );

        if (existing) {
          existing.isActive = args.update.isActive;
          return existing;
        }

        const created: UserBlockRow = {
          id: `ub-${userBlocks.length + 1}`,
          blockerId: args.create.blockerId,
          blockedId: args.create.blockedId,
          isActive: args.create.isActive,
        };
        userBlocks.push(created);
        return created;
      }),
      updateMany: jest.fn(async (args: {
        where: { blockerId: string; blockedId: string; isActive: boolean };
        data: { isActive: boolean };
      }) => {
        let count = 0;
        for (const row of userBlocks) {
          if (
            row.blockerId === args.where.blockerId &&
            row.blockedId === args.where.blockedId &&
            row.isActive === args.where.isActive
          ) {
            row.isActive = args.data.isActive;
            count += 1;
          }
        }

        return { count };
      }),
      findMany: jest.fn(async (args: {
        where: {
          blockerId: string;
          blockedId?: { in: string[] };
          isActive: boolean;
        };
        select: { blockedId: true };
      }) => {
        const inList = args.where.blockedId?.in;
        return userBlocks
          .filter(
            (row) =>
              row.blockerId === args.where.blockerId &&
              row.isActive === args.where.isActive &&
              (inList ? inList.includes(row.blockedId) : true),
          )
          .map((row) => ({ blockedId: row.blockedId }));
      }),
    },
  };

  const makeBid = (id: string, bidderId: string, amount: number) => {
    const now = new Date('2026-04-21T12:00:00.000Z');
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
    userBlocks.length = 0;
    jest.clearAllMocks();

    bidRepository.findMany.mockResolvedValue([
      makeBid('bid-1', 'bidder-1', 1000),
      makeBid('bid-2', 'bidder-2', 1100),
    ]);
    bidRepository.count.mockResolvedValue(2);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidService,
        UserService,
        { provide: BidRepository, useValue: bidRepository },
        { provide: AuctionRepository, useValue: { findById: jest.fn() } },
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: {} },
        { provide: AuctionSchedulingService, useValue: {} },
        { provide: UserRepository, useValue: userRepository },
        { provide: FIREBASE_SERVICE_TOKEN, useValue: {} },
        { provide: OtpService, useValue: {} },
        { provide: DeviceTokensService, useValue: {} },
      ],
    }).compile();

    bidService = module.get<BidService>(BidService);
    userService = module.get<UserService>(UserService);
  });

  it('updates isBidderBlockedByCurrentUser after block and unblock', async () => {
    const currentUser = { id: 'owner-1', role: UserRole.USER };

    const before = await bidService.findAll({ page: 1, limit: 20 }, currentUser);
    expect(before.data.map((row) => row.isBidderBlockedByCurrentUser)).toEqual([
      false,
      false,
    ]);

    await userService.blockUser(currentUser.id, 'bidder-1');

    const afterBlock = await bidService.findAll(
      { page: 1, limit: 20 },
      currentUser,
    );
    expect(afterBlock.data.map((row) => row.isBidderBlockedByCurrentUser)).toEqual([
      true,
      false,
    ]);

    await userService.unblockUser(currentUser.id, 'bidder-1');

    const afterUnblock = await bidService.findAll(
      { page: 1, limit: 20 },
      currentUser,
    );
    expect(
      afterUnblock.data.map((row) => row.isBidderBlockedByCurrentUser),
    ).toEqual([false, false]);
  });
});
