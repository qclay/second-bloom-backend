import { Global, Module } from '@nestjs/common';
import { SmsModule } from './sms/sms.module';
import { StorageModule } from './storage/storage.module';
import { FirebaseModule } from './firebase/firebase.module';
import { TelegramModule } from './telegram/telegram.module';

@Global()
@Module({
  imports: [SmsModule, StorageModule, FirebaseModule, TelegramModule],
  exports: [SmsModule, StorageModule, FirebaseModule, TelegramModule],
})
export class InfrastructureModule {}
