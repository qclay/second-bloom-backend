import { Queue } from 'bull';
export declare class CleanExpiredOtpsScheduler {
    private readonly authQueue;
    private readonly logger;
    constructor(authQueue: Queue);
    scheduleCleanExpiredOtps(): Promise<void>;
}
