import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { SchedulerRegistry } from '@nestjs/schedule';
import { FirebaseService } from '../src/infrastructure/firebase/firebase.service';

describe('Jobs (e2e)', () => {
    let app: INestApplication;
    let schedulerRegistry: SchedulerRegistry;

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
        await app.init();
        schedulerRegistry = app.get(SchedulerRegistry);
    });

    afterAll(async () => {
        await app.close();
    });

    it('should have all expected cron jobs registered', () => {
        const jobs = schedulerRegistry.getCronJobs();

        const expectedJobs = [
            'end-expired-auctions',
            'clean-expired-otps',
            'deactivate-order-conversations',
            'expire-pending-payments'
        ];

        const registeredJobNames = Array.from(jobs.keys());

        expectedJobs.forEach(jobName => {
            expect(registeredJobNames).toContain(jobName);
        });
    });
});
