import { IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPhoneChangeOtpDto {
  @ApiProperty({
    description: 'New phone number in Uzbekistan format',
    example: '+998901234567',
    required: true,
  })
  @IsPhoneNumber('UZ')
  newPhoneNumber!: string;
}
