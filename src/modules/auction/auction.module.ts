import { Module, forwardRef } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionRepository } from './repositories/auction.repository';
import { AuctionGateway } from './gateways/auction.gateway';
import { ProductModule } from '../product/product.module';
import { NotificationModule } from '../notification/notification.module';
import { JwtModule } from '@nestjs/jwt';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => ProductModule),
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
  controllers: [AuctionController],
  providers: [AuctionService, AuctionRepository, AuctionGateway],
  exports: [AuctionService, AuctionRepository, AuctionGateway],
})
export class AuctionModule {}
