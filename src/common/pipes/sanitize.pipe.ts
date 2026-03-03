import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { sanitize } from 'class-sanitizer';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    void metadata;
    if (typeof value === 'object' && value !== null) {
      sanitize(value);
    }
    return value;
  }
}
