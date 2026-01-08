import { Job } from 'bull';
import { AuctionService } from '../../modules/auction/auction.service';
export declare class EndExpiredAuctionsProcessor {
    private readonly auctionService;
    private readonly logger;
    constructor(auctionService: AuctionService);
    handleEndExpired(job: Job<{
        timestamp: number;
    }>): Promise<void>;
}
