import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { FirebaseService } from './firebase.service';
import { FIREBASE_SERVICE_TOKEN } from './firebase-service.interface';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    FirebaseService,
    {
      provide: FIREBASE_SERVICE_TOKEN,
      useExisting: FirebaseService,
    },
  ],
  exports: [FirebaseService, FIREBASE_SERVICE_TOKEN],
})
export class FirebaseModule {}
