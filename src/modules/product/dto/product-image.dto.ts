import { ApiProperty } from '@nestjs/swagger';

export class ProductImageDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id!: string;

  @ApiProperty({ example: 'https://cdn.example.com/images/rose.jpg' })
  url!: string;
}
