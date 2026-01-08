import { ApiProperty } from '@nestjs/swagger';
import { ProductImageDto } from './product-image.dto';

export class ProductNestedDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({ type: [ProductImageDto], required: false })
  images?: ProductImageDto[];
}
