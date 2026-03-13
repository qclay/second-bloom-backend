import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { EndExpiredAuctionsScheduler } from './auction/end-expired-auctions.scheduler';
import { CleanExpiredOtpsScheduler } from './auth/clean-expired-otps.scheduler';
import { ExpirePendingPaymentsScheduler } from './payment/expire-pending-payments.scheduler';
import { DeactivateOrderConversationsScheduler } from './conversation/deactivate-order-conversations.scheduler';

@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class JobsAdminController {
  constructor(
    private readonly auctionsScheduler: EndExpiredAuctionsScheduler,
    private readonly otpsScheduler: CleanExpiredOtpsScheduler,
    private readonly paymentsScheduler: ExpirePendingPaymentsScheduler,
    private readonly conversationsScheduler: DeactivateOrderConversationsScheduler,
  ) {}

  @Post(':job/run')
  async runJob(@Param('job') job: string) {
    switch (job) {
      case 'auctions':
        await this.auctionsScheduler.scheduleEndExpiredAuctions();
        return { success: true, message: 'Auction job scheduled' };
      case 'otps':
        await this.otpsScheduler.scheduleCleanExpiredOtps();
        return { success: true, message: 'OTPs job scheduled' };
      case 'payments':
        await this.paymentsScheduler.runExpirePendingPayments();
        return { success: true, message: 'Payments job scheduled' };
      case 'conversations':
        await this.conversationsScheduler.runDeactivateOrderConversationsSweep();
        return { success: true, message: 'Conversations job scheduled' };
      default:
        return { success: false, message: 'Unknown job' };
    }
  }
}
