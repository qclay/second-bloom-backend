import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { sanitize } from 'class-sanitizer';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(
    value: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metadata: ArgumentMetadata,
  ): unknown {
    if (typeof value === 'object' && value !== null) {
      sanitize(value);
    }
    return value;
  }
}
