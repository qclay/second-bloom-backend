import { Global, Module } from '@nestjs/common';
import { SmsModule } from './sms/sms.module';
import { AwsModule } from './aws/aws.module';
import { PaymentInfrastructureModule } from './payment/payment.module';
import { FirebaseModule } from './firebase/firebase.module';
import { TelegramModule } from './telegram/telegram.module';

@Global()
@Module({
  imports: [
    SmsModule,
    AwsModule,
    PaymentInfrastructureModule,
    FirebaseModule,
    TelegramModule,
  ],
  exports: [
    SmsModule,
    AwsModule,
    PaymentInfrastructureModule,
    FirebaseModule,
    TelegramModule,
  ],
})
export class InfrastructureModule {}
