import { ApiProperty } from '@nestjs/swagger';

export class ProductImageDto {
  @ApiProperty({ required: false })
  url?: string;
}
