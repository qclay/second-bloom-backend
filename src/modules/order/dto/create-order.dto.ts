import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Product ID to order',
    example: 'clx1234567890abcdef',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Auction ID if order is from ended auction',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsOptional()
  auctionId?: string;

  @ApiProperty({
    description: 'Order amount',
    example: 150000,
    minimum: 0.01,
    required: true,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main Street, Tashkent, Uzbekistan',
    maxLength: 1000,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  shippingAddress?: string;

  @ApiProperty({
    description: 'Additional notes for the order',
    example: 'Please deliver in the morning',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
