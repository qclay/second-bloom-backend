import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  shippingAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @IsDateString()
  @IsOptional()
  shippedAt?: string;

  @IsDateString()
  @IsOptional()
  deliveredAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  cancellationReason?: string;
}
