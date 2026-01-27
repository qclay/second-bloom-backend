import { IsPhoneNumber, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VerifyPhoneChangeDto {
  @ApiProperty({
    description: 'New phone number in Uzbekistan format',
    example: '+998901234567',
    required: true,
  })
  @IsPhoneNumber('UZ')
  newPhoneNumber!: string;

  @ApiProperty({
    description: 'Verification code sent to the new phone number',
    example: 123456,
    required: true,
    type: Number,
  })
  @IsNumber()
  @Min(100000)
  @Max(999999)
  @Type(() => Number)
  code!: number;
}
