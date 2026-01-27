import { IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPhoneChangeOtpDto {
  @ApiProperty({
    example: '+998',
    description: 'Country calling code for the new number (e.g. +998, +1)',
    required: true,
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{0,3}$/, {
    message: 'newCountryCode must be a valid calling code (e.g. +998, +1)',
  })
  newCountryCode!: string;

  @ApiProperty({
    description: 'New local phone number without country code',
    example: '901234567',
    required: true,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'newPhoneNumber must contain only digits' })
  newPhoneNumber!: string;
}
