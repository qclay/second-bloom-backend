import { Module, Global } from '@nestjs/common';
import { AwsService } from './aws.service';
import { ConfigModule } from '../../config/config.module';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
