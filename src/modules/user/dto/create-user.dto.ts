import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Phone number in Uzbekistan format',
    example: '+998901234567',
    required: true,
  })
  @IsPhoneNumber('UZ')
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
