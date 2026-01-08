import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class SanitizePipe implements PipeTransform {
    transform(value: unknown, _metadata: ArgumentMetadata): unknown;
}
