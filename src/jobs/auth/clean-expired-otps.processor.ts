import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('auth')
export class CleanExpiredOtpsProcessor {
  private readonly logger = new Logger(CleanExpiredOtpsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('auth') private readonly authQueue: Queue,
  ) {}

  @Process('clean-expired-otps')
  async handleCleanExpiredOtps(
    job: Job<{ timestamp: number; batchSize?: number }>,
  ): Promise<void> {
    this.logger.log(
      `Processing clean expired OTPs job ${job.id} at ${new Date(job.data.timestamp).toISOString()}`,
    );

    try {
      const batchSize = job.data.batchSize || 500;
      const now = new Date();

      const otpsToDelete = await this.prisma.verificationCode.findMany({
        where: {
          OR: [{ expiresAt: { lt: now } }, { isUsed: true }],
        },
        select: { id: true },
        take: batchSize,
      });

      if (otpsToDelete.length === 0) {
        this.logger.log(`No expired/used OTPs to clean (Job ${job.id})`);
        return;
      }

      const idsToDelete = otpsToDelete.map((otp) => otp.id);

      const result = await this.prisma.verificationCode.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      });

      this.logger.log(
        `Successfully cleaned ${result.count} expired/used OTPs (Job ${job.id})`,
      );

      if (otpsToDelete.length === batchSize) {
        this.logger.log(`More expired OTPs found. Rescheduling job ${job.id}`);
        await this.authQueue.add(
          'clean-expired-otps',
          {
            timestamp: Date.now(),
            batchSize,
          },
          { delay: 1000 },
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to clean expired OTPs (Job ${job.id})`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
