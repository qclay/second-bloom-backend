import {
  IsNumber,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VerifyOtpDto {
  @ApiProperty({
    example: '+998',
    description: 'Country calling code (e.g. +998, +1, +44)',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{0,3}$/, {
    message: 'countryCode must be a valid calling code (e.g. +998, +1)',
  })
  countryCode!: string;

  @ApiProperty({
    description: 'Local phone number without country code',
    example: '901234567',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'phoneNumber must contain only digits' })
  phoneNumber!: string;

  @ApiProperty({
    description: '6-digit verification code',
    example: 123456,
    minimum: 100000,
    maximum: 999999,
    required: true,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(100000)
  @Max(999999)
  @Type(() => Number)
  code!: number;
}
