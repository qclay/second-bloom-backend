import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetOrCreateByProductDto {
  @ApiProperty({
    description: 'Product ID to open chat with seller',
    example: 'clx1234567890abcdef',
  })
  @IsUUID()
  productId!: string;
}
