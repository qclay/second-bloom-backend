import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { SentryService } from '../services/sentry.service';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockRequest = {
    url: '/api/test',
    method: 'GET',
    headers: {},
    id: 'req-123',
  } as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            error: jest.fn(),
            warn: jest.fn(),
            log: jest.fn(),
          },
        },
        {
          provide: SentryService,
          useValue: {
            captureException: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'API_DOCS_URL') return 'https://docs.example.com';
              return null;
            }),
          },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('Prisma Error Handling', () => {
    it('should handle P2002 (Duplicate entry) in Russian', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: '1.0',
        meta: { target: ['email'] },
      });

      const requestWithLang = {
        ...mockRequest,
        headers: { 'accept-language': 'ru' },
      } as Request;
      const host = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => requestWithLang,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Дубликат записи: email уже существует',
          }),
        }),
      );
    });

    it('should handle P2002 (Duplicate entry) in Uzbek', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: '1.0',
        meta: { target: ['phone'] },
      });

      const requestWithLang = {
        ...mockRequest,
        headers: { 'accept-language': 'uz' },
      } as Request;
      const host = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => requestWithLang,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Bunday maʼlumot mavjud: phone allaqachon bor',
          }),
        }),
      );
    });

    it('should handle P2025 (Not Found) in English', () => {
      const exception = new Prisma.PrismaClientKnownRequestError('Not Found', {
        code: 'P2025',
        clientVersion: '1.0',
      });

      const requestWithLang = {
        ...mockRequest,
        headers: { 'accept-language': 'en' },
      } as Request;
      const host = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => requestWithLang,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Record not found',
          }),
        }),
      );
    });

    it('should handle P2023 (Invalid UUID or field format) as bad request', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Inconsistent column data',
        {
          code: 'P2023',
          clientVersion: '1.0',
        },
      );

      const requestWithLang = {
        ...mockRequest,
        headers: { 'accept-language': 'en' },
      } as Request;
      const host = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => requestWithLang,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, host);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Database validation error',
          }),
        }),
      );
    });
  });

  describe('General HTTP Exceptions', () => {
    it('should translate generic record not found error', () => {
      const requestWithLang = {
        ...mockRequest,
        headers: { 'accept-language': 'ru' },
      } as Request;
      const host = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => requestWithLang,
        }),
      } as unknown as ArgumentsHost;

      const httpException = new Prisma.PrismaClientKnownRequestError(
        'Not Found',
        { code: 'P2025', clientVersion: '0' },
      );
      filter.catch(httpException, host);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Запись не найдена',
          }),
        }),
      );
    });
  });
});
