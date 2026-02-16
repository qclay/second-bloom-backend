import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateways/chat.gateway';
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
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ConversationRepository,
    MessageRepository,
  ],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
