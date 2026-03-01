import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { FirebaseModule } from '../../infrastructure/firebase/firebase.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService, NotificationRepository],
})
export class NotificationModule {}
