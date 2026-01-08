import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('auth')
export class CleanExpiredOtpsProcessor {
  private readonly logger = new Logger(CleanExpiredOtpsProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('clean-expired-otps')
  async handleCleanExpiredOtps(job: Job<{ timestamp: number }>): Promise<void> {
    this.logger.log(
      `Processing clean expired OTPs job ${job.id} at ${new Date(job.data.timestamp).toISOString()}`,
    );

    try {
      const now = new Date();
      const result = await this.prisma.verificationCode.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: now } }, { isUsed: true }],
        },
      });

      this.logger.log(
        `Successfully cleaned ${result.count} expired/used OTPs (Job ${job.id})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to clean expired OTPs (Job ${job.id})`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
