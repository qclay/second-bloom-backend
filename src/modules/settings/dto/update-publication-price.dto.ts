import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class UpdatePublicationPriceDto {
  @ApiProperty({
    example: 25000,
    description: 'Price per publication post in UZS',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    example: 'Price adjusted for promotion',
    description: 'Description of the price change',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'admin-user-id',
    description: 'ID of admin who updated the price',
    required: false,
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
