import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationGateway } from './gateways/conversation.gateway';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        return {
          secret,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [ConversationController],
  providers: [
    ConversationService,
    ConversationGateway,
    ConversationRepository,
    MessageRepository,
  ],
  exports: [ConversationService, ConversationGateway],
})
export class ConversationModule {}
