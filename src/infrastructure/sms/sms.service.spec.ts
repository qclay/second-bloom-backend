import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('SmsService Localization', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'NODE_ENV') return 'production';
              if (key === 'sms.apiUrl') return 'https://api.example.com';
              if (key === 'sms.email') return 'test@example.com';
              if (key === 'sms.password') return 'password';
              return defaultValue;
            }),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest
              .fn()
              .mockReturnValue(
                of({ status: 200, data: { status: 'success' } }),
              ),
          },
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);

    (service as unknown as { token: string }).token = 'mock-token';
    (service as unknown as { tokenExpiresAt: number }).tokenExpiresAt =
      Date.now() + 10000;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should send localized OTP in Russian', async () => {
      const sendMessageSpy = jest
        .spyOn(service, 'sendMessage')
        .mockResolvedValue(true);

      await service.sendOtp('+998901234567', '123456', 'ru');

      expect(sendMessageSpy).toHaveBeenCalledWith(
        '+998901234567',
        'Код для входа в приложение SecondBloom: 123456',
      );
    });

    it('should send localized OTP in Uzbek (default)', async () => {
      const sendMessageSpy = jest
        .spyOn(service, 'sendMessage')
        .mockResolvedValue(true);

      await service.sendOtp('+998901234567', '123456', 'uz');

      expect(sendMessageSpy).toHaveBeenCalledWith(
        '+998901234567',
        'Код для входа в приложение SecondBloom: 123456',
      );
    });

    it('should send localized OTP in English', async () => {
      const sendMessageSpy = jest
        .spyOn(service, 'sendMessage')
        .mockResolvedValue(true);

      await service.sendOtp('+998901234567', '123456', 'en');

      expect(sendMessageSpy).toHaveBeenCalledWith(
        '+998901234567',
        'Код для входа в приложение SecondBloom: 123456',
      );
    });
  });
});
