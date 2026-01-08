import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
export declare class CleanExpiredOtpsProcessor {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCleanExpiredOtps(job: Job<{
        timestamp: number;
    }>): Promise<void>;
}
