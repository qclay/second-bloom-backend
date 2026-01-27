import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
    description: 'Local phone number without country code',
    example: '901234567',
    required: true,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'phoneNumber must contain only digits' })
  phoneNumber!: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
    maxLength: 255,
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiProperty({
    description: 'Username (unique identifier)',
    example: 'johndoe',
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  username?: string;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  gender?: string;

  @ApiProperty({
    description: 'Language preference',
    example: 'uz',
    maxLength: 10,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  language?: string;

  @ApiProperty({
    description: 'Country',
    example: 'Uzbekistan',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;
}
