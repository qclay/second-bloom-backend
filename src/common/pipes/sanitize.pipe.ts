import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { sanitize } from 'class-sanitizer';

@Injectable()
export class SanitizePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- PipeTransform requires 2nd arg
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    if (typeof value === 'object' && value !== null) {
      sanitize(value);
    }
    return value;
  }
}
