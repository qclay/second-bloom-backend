import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsUUID,
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
}
