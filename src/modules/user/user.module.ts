import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { FileModule } from '../file/file.module';
import { FirebaseModule } from '../../infrastructure/firebase/firebase.module';

@Module({
  imports: [PrismaModule, FileModule, FirebaseModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
