import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { FIREBASE_SERVICE_TOKEN } from '../../infrastructure/firebase/firebase-service.interface';
import { OtpService } from '../auth/services/otp.service';
import { DeviceTokensService } from '../../redis/device-tokens.service';

describe('UserService blocking flow', () => {
  let service: UserService;

  let userRepository: {
    findById: jest.Mock;
  };

  let prisma: {
    userBlock: {
      upsert: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
    };

    prisma = {
      userBlock: {
        upsert: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: FIREBASE_SERVICE_TOKEN,
          useValue: {},
        },
        {
          provide: OtpService,
          useValue: {},
        },
        {
          provide: DeviceTokensService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('blockUser should upsert active userBlock row', async () => {
    userRepository.findById
      .mockResolvedValueOnce({ id: 'user-1', deletedAt: null })
      .mockResolvedValueOnce({ id: 'user-2', deletedAt: null });

    const result = await service.blockUser('user-1', 'user-2');

    expect(prisma.userBlock.upsert).toHaveBeenCalledWith({
      where: {
        blockerId_blockedId: {
          blockerId: 'user-1',
          blockedId: 'user-2',
        },
      },
      create: {
        blockerId: 'user-1',
        blockedId: 'user-2',
        isActive: true,
      },
      update: {
        isActive: true,
      },
    });

    expect(result).toEqual({ message: 'User blocked successfully' });
  });

  it('blockUser should reject self-blocking', async () => {
    await expect(service.blockUser('user-1', 'user-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('unblockUser should deactivate active block row', async () => {
    userRepository.findById
      .mockResolvedValueOnce({ id: 'user-1', deletedAt: null })
      .mockResolvedValueOnce({ id: 'user-2', deletedAt: null });
    prisma.userBlock.findFirst.mockResolvedValue({ id: 'block-1' });

    const result = await service.unblockUser('user-1', 'user-2');

    expect(prisma.userBlock.findFirst).toHaveBeenCalledWith({
      where: {
        blockerId: 'user-1',
        blockedId: 'user-2',
        isActive: true,
      },
      select: { id: true },
    });

    expect(prisma.userBlock.update).toHaveBeenCalledWith({
      where: {
        id: 'block-1',
      },
      data: {
        isActive: false,
      },
    });

    expect(result).toEqual({ message: 'User unblocked successfully' });
  });

  it('unblockUser should throw when active block does not exist', async () => {
    userRepository.findById
      .mockResolvedValueOnce({ id: 'user-1', deletedAt: null })
      .mockResolvedValueOnce({ id: 'user-2', deletedAt: null });
    prisma.userBlock.findFirst.mockResolvedValue(null);

    await expect(service.unblockUser('user-1', 'user-2')).rejects.toThrow(
      NotFoundException,
    );
  });
});
