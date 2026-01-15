import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsObject, IsInt, Min } from 'class-validator';
import { PaymentGateway } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({
    example: 2,
    description: 'Number of posts to purchase',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    example: 'PAYME',
    enum: PaymentGateway,
    required: false,
    description: 'Payment gateway (defaults to PAYME)',
  })
  @IsEnum(PaymentGateway)
  @IsOptional()
  gateway?: PaymentGateway;

  @ApiProperty({
    required: false,
    description: 'Additional metadata for the payment',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
