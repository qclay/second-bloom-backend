import { Global, Module } from '@nestjs/common';
import { SmsModule } from './sms/sms.module';
import { AwsModule } from './aws/aws.module';
import { FirebaseModule } from './firebase/firebase.module';
import { TelegramModule } from './telegram/telegram.module';

@Global()
@Module({
  imports: [SmsModule, AwsModule, FirebaseModule, TelegramModule],
  exports: [SmsModule, AwsModule, FirebaseModule, TelegramModule],
})
export class InfrastructureModule {}
