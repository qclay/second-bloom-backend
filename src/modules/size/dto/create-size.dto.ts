import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSizeDto {
  @ApiProperty({
    description: 'Size name (e.g. Quite large). Slug auto-generated.',
    example: 'Quite large',
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
