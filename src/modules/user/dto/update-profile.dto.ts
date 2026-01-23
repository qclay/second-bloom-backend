import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'First name',
    example: 'John',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? null : value))
  firstName?: string | null;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? null : value))
  lastName?: string | null;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
    maxLength: 255,
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => (value === '' ? null : value))
  email?: string | null;

  @ApiProperty({
    description: 'Region',
    example: 'Tashkent',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? null : value))
  region?: string | null;

  @ApiProperty({
    description: 'City',
    example: 'Tashkent',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? null : value))
  city?: string | null;

  @ApiProperty({
    description: 'District',
    example: 'Yunusabad',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? null : value))
  district?: string | null;

  @ApiProperty({
    description: 'Avatar file ID',
    example: 'c0e6196e-1bb4-4e9a-b168-022bc08d5bc4',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  avatarId?: string | null;

  @ApiProperty({
    description: 'Birth date (ISO 8601 format)',
    example: '1990-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  birthDate?: string | null;

  @ApiProperty({
    description: 'Username (unique identifier)',
    example: 'johndoe',
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) => (value === '' ? null : value))
  username?: string | null;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Transform(({ value }) => (value === '' ? null : value))
  gender?: string | null;

  @ApiProperty({
    description: 'Language preference',
    example: 'uz',
    maxLength: 10,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  @Transform(({ value }) => (value === '' ? null : value))
  language?: string | null;

  @ApiProperty({
    description: 'Country',
    example: 'Uzbekistan',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? null : value))
  country?: string | null;
}
