import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentGateway } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty({ enum: PaymentGateway, nullable: true })
  gateway!: PaymentGateway | null;

  @ApiProperty({ nullable: true })
  transactionId!: string | null;

  @ApiProperty({ nullable: true })
  invoiceUrl!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
