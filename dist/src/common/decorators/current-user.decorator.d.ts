import { User } from '@prisma/client';
export declare const CurrentUser: <T extends keyof User>(...dataOrPipes: (T | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
