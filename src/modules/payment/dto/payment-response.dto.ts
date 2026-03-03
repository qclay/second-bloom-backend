import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentGateway, PaymentType } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: PaymentType })
  paymentType!: PaymentType;

  @ApiProperty({ enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty({ enum: PaymentGateway, nullable: true })
  gateway!: PaymentGateway | null;

  @ApiProperty({ nullable: true })
  invoiceUrl!: string | null;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z' })
  updatedAt!: string;
}
