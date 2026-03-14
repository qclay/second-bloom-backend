import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/infrastructure/firebase/firebase.service';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
        .overrideProvider(FirebaseService)
        .useValue({
            onModuleInit: jest.fn(),
            sendNotification: jest.fn().mockResolvedValue(true),
            sendNotificationToMultiple: jest.fn().mockResolvedValue({ success: 1, failure: 0 }),
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
        .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect((res: request.Response) => {
                expect(res.body.data.status).toBe('ok');
                expect(res.body.data.message).toBe('Second Bloom API');
            });
    });

    it('/health (GET)', () => {
        return request(app.getHttpServer())
            .get('/health')
            .expect(200);
    });
});
