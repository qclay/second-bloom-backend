import { ExceptionFilter, ArgumentsHost, BadRequestException } from '@nestjs/common';
export declare class ValidationExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: BadRequestException, host: ArgumentsHost): void;
    private formatValidationErrors;
}
