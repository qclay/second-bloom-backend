import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { PaymentService } from './payment.service';
import { PaymeStrategy } from './strategies/payme.strategy';
import { ClickStrategy } from './strategies/click.strategy';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PaymentService, PaymeStrategy, ClickStrategy],
  exports: [PaymentService],
})
export class PaymentInfrastructureModule {}
