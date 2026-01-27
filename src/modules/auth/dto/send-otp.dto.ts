import { IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    example: '+998',
    description: 'Country calling code (e.g. +998, +1, +44)',
    required: true,
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{0,3}$/, {
    message: 'countryCode must be a valid calling code (e.g. +998, +1)',
  })
  countryCode!: string;

  @ApiProperty({
    example: '901234567',
    description: 'Local phone number without country code',
    required: true,
  })
  @IsString()
  @MinLength(6, { message: 'phoneNumber must be at least 6 digits' })
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'phoneNumber must contain only digits' })
  phoneNumber!: string;
}
