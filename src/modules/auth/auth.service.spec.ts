import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRepository } from '../../modules/user/repositories/user.repository';
import { VerificationCodeRepository } from './repositories/verification-code.repository';
import {
  createTestUser,
  createTestVerificationCode,
  cleanupTestData,
} from '../../../test/helpers/test-helpers';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let verificationCodeRepository: VerificationCodeRepository;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn().mockReturnValue({ sub: 'user-id' }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '7d',
        REFRESH_TOKEN_SECRET: 'test-refresh-secret',
        REFRESH_TOKEN_EXPIRES_IN: '30d',
      };
      return config[key];
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn((callback) =>
              callback({
                user: { create: jest.fn(), findUnique: jest.fn() },
                verificationCode: {
                  create: jest.fn(),
                  findFirst: jest.fn(),
                  updateMany: jest.fn(),
                },
              }),
            ),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByPhoneNumber: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: VerificationCodeRepository,
          useValue: {
            create: jest.fn(),
            findValid: jest.fn(),
            markAsUsed: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    verificationCodeRepository = module.get<VerificationCodeRepository>(
      VerificationCodeRepository,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('sendOtp', () => {
    it('should send OTP to new user phone number', async () => {
      const phoneNumber = '+998901234567';
      const result = await service.sendOtp({
        phoneNumber,
      });

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('successfully');
    });

    it('should send OTP to existing user', async () => {
      const phoneNumber = '+998901234567';
      await createTestUser({ phoneNumber });
      const result = await service.sendOtp({
        phoneNumber,
      });

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('successfully');
    });
  });

  describe('verifyOtp', () => {
    it('should throw UnauthorizedException for invalid OTP', async () => {
      const phoneNumber = '+998901234567';
      (verificationCodeRepository.findValid as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.verifyOtp({
          phoneNumber,
          code: '123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should create new user and return tokens for valid OTP', async () => {
      const phoneNumber = '+998901234567';
      const code = '123456';
      const verificationCode = await createTestVerificationCode(
        phoneNumber,
        code,
      );

      (verificationCodeRepository.findValid as jest.Mock).mockResolvedValue(
        verificationCode,
      );
      (verificationCodeRepository.markAsUsed as jest.Mock).mockResolvedValue(
        verificationCode,
      );

      const result = await service.verifyOtp({
        phoneNumber,
        code,
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(
        (verificationCodeRepository.markAsUsed as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.refreshToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens for valid refresh token', async () => {
      const user = await createTestUser();
      (userRepository.findById as jest.Mock).mockResolvedValue(user);
      mockJwtService.verify.mockReturnValue({ sub: user.id });

      const result = await service.refreshToken({
        refreshToken: 'valid-refresh-token',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
