import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { SchedulerRegistry } from '@nestjs/schedule';
import { FirebaseService } from '../src/infrastructure/firebase/firebase.service';
import { EndExpiredAuctionsScheduler } from '../src/jobs/auction/end-expired-auctions.scheduler';

describe('Jobs (e2e)', () => {
    let app: INestApplication;
    let schedulerRegistry: SchedulerRegistry;
    let auctionQueue: any;
    let authQueue: any;
    let conversationQueue: any;
    let paymentQueue: any;
    let auctionsScheduler: EndExpiredAuctionsScheduler;

    beforeAll(async () => {
        process.env.CRON_ENABLED = 'true';
        process.env.CRON_AUCTIONS_ENABLED = 'true';
        process.env.CRON_OTPS_ENABLED = 'true';
        process.env.CRON_PAYMENTS_ENABLED = 'true';
        process.env.CRON_CONVERSATIONS_ENABLED = 'true';

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
            .overrideProvider('REDIS_CLIENT')
            .useValue({
                on: jest.fn(),
                get: jest.fn(),
                set: jest.fn(),
                del: jest.fn(),
                disconnect: jest.fn(),
                quit: jest.fn(),
            })
            .overrideProvider('BullQueue_auction')
            .useValue({
                add: jest.fn().mockResolvedValue({}),
                getRepeatableJobs: jest.fn().mockResolvedValue([]),
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
        auctionQueue = app.get('BullQueue_auction');
        authQueue = app.get('BullQueue_auth');
        conversationQueue = app.get('BullQueue_conversation');
        paymentQueue = app.get('BullQueue_payment');
        auctionsScheduler = app.get(EndExpiredAuctionsScheduler);
    });

    afterAll(async () => {
        await app.close();
    });

    it('should have all expected cron jobs registered', () => {
        const jobs = schedulerRegistry.getCronJobs();

        const expectedJobs = [
            'clean-expired-otps',
            'deactivate-order-conversations',
            'expire-pending-payments'
        ];

        const registeredJobNames = Array.from(jobs.keys());

        expectedJobs.forEach(jobName => {
            expect(registeredJobNames).toContain(jobName);
        });
    });

    describe('Job Execution', () => {
        it('end-expired-auctions should register repeatable queue job and support manual trigger', async () => {
            expect(auctionQueue.add).toHaveBeenCalledWith(
                'end-expired',
                {
                    batchSize: expect.any(Number),
                },
                {
                    jobId: 'end-expired-auctions-repeatable',
                    repeat: {
                        cron: expect.any(String),
                    },
                },
            );

            await auctionsScheduler.scheduleEndExpiredAuctions();

            expect(auctionQueue.add).toHaveBeenCalledWith(
                'end-expired',
                {
                    batchSize: expect.any(Number),
                },
            );
        });

        it('clean-expired-otps should add job to auth queue', async () => {
            const job = schedulerRegistry.getCronJob('clean-expired-otps');
            // @ts-ignore
            await (job as any).fireOnTick();

            expect(authQueue.add).toHaveBeenCalledWith('clean-expired-otps', expect.any(Object));
        });

        it('deactivate-order-conversations should add job to conversation queue', async () => {
            const job = schedulerRegistry.getCronJob('deactivate-order-conversations');
            // @ts-ignore
            await (job as any).fireOnTick();

            expect(conversationQueue.add).toHaveBeenCalledWith('deactivate-order-conversations', expect.any(Object));
        });

        it('expire-pending-payments should add job to payment queue', async () => {
            const job = schedulerRegistry.getCronJob('expire-pending-payments');
            // @ts-ignore
            await (job as any).fireOnTick();

            expect(paymentQueue.add).toHaveBeenCalledWith('expire-stale', expect.any(Object));
        });
    });
});
