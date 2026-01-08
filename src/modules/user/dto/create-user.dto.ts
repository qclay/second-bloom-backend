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
}
