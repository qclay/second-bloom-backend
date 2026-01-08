import { IsString, IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number in Uzbekistan format',
    example: '+998901234567',
    required: true,
  })
  @IsPhoneNumber('UZ')
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({
    description: '6-digit verification code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}
