import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileRepository } from './repositories/file.repository';
import { FileValidationInterceptor } from './interceptors/file-validation.interceptor';

@Module({
  controllers: [FileController],
  providers: [FileService, FileRepository, FileValidationInterceptor],
  exports: [FileService, FileRepository],
})
export class FileModule {}
