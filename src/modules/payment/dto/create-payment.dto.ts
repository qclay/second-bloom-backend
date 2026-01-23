import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsObject,
  IsNumber,
} from 'class-validator';
import { PaymentGateway, PaymentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.PUBLICATION,
    description: 'Type of payment: PUBLICATION for posts, TOP_UP for balance',
    default: PaymentType.PUBLICATION,
    required: false,
  })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType = PaymentType.PUBLICATION;

  @ApiProperty({
    example: 2,
    description: 'Number of posts to purchase (for PUBLICATION type)',
    minimum: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    example: 100000,
    description: 'Amount to top up in UZS (for TOP_UP type)',
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  amount?: number;

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
