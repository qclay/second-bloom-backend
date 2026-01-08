import { Queue } from 'bull';
export declare class EndExpiredAuctionsScheduler {
    private readonly auctionQueue;
    private readonly logger;
    constructor(auctionQueue: Queue);
    scheduleEndExpiredAuctions(): Promise<void>;
}
