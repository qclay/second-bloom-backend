import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsObject,
  IsOptional,
  IsIn,
} from 'class-validator';

export class WebhookMetaDataDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  customer_name?: string;

  @ApiProperty({ example: 'Payment for services', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '12345', required: false })
  @IsString()
  @IsOptional()
  order_id?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  package_id?: string;
}

export class WebhookPayloadDto {
  @ApiProperty({
    example: 1000,
    description: 'Payment amount in tiyins (1000 = 10 UZS)',
  })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 20, description: 'Invoice ID from payment gateway' })
  @IsNumber()
  invoice_id!: number;

  @ApiProperty({ type: WebhookMetaDataDto, required: false })
  @IsObject()
  @IsOptional()
  meta_data?: WebhookMetaDataDto;

  @ApiProperty({
    example: 'success',
    description: 'Payment status',
    enum: ['success', 'failed', 'pending', 'cancelled'],
  })
  @IsString()
  @IsIn(['success', 'failed', 'pending', 'cancelled'])
  status!: string;
}
