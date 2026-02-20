import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductImageDto } from './product-image.dto';

export class ProductNestedDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true })
  title?: string | null;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({ type: [ProductImageDto], required: false })
  images?: ProductImageDto[];
}
