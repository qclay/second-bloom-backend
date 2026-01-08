import { IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    example: '+998901234567',
    description: 'Phone number in international format (E.164)',
    required: true,
  })
  @IsPhoneNumber()
  phoneNumber!: string;
}
