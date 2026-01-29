import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConditionDto {
  @ApiProperty({
    description: 'Condition name (e.g. Like New). Slug auto-generated.',
    example: 'Like New',
    maxLength: 100,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
