import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    description: 'Local phone number without country code',
    example: '901234567',
  })
  phoneNumber!: string;

  @ApiProperty({
    description:
      'Country calling code (e.g. +998, +1, +44)',
    example: '+998',
    required: false,
    nullable: true,
  })
  countryCode!: string | null;

  @ApiProperty({ required: false, nullable: true })
  firstName!: string | null;

  @ApiProperty({ required: false, nullable: true })
  lastName!: string | null;

  @ApiProperty({ required: false, nullable: true })
  email!: string | null;

  @ApiProperty({ required: false, nullable: true })
  avatarId!: string | null;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl!: string | null;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  totalRatings!: number;

  @ApiProperty({ required: false, nullable: true })
  region!: string | null;

  @ApiProperty({ required: false, nullable: true })
  city!: string | null;

  @ApiProperty({ required: false, nullable: true })
  district!: string | null;

  @ApiProperty({ required: false, nullable: true })
  birthDate!: string | null;

  @ApiProperty({ required: false, nullable: true })
  username!: string | null;

  @ApiProperty({ required: false, nullable: true })
  gender!: string | null;

  @ApiProperty({ required: false, nullable: true })
  language!: string | null;

  @ApiProperty({ required: false, nullable: true })
  country!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromEntity(
    user: User | (User & { avatar?: { url: string } | null }),
  ): UserResponseDto {
    const avatarUrl = 'avatar' in user && user.avatar ? user.avatar.url : null;

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      countryCode:
        user.phoneCountryCode ??
        (typeof user.phoneNumber === 'string'
          ? user.phoneNumber.match(/^\+(\d{1,3})/)?.[0] ?? null
          : null),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarId: user.avatarId,
      avatarUrl,
      isVerified: user.isVerified,
      isActive: user.isActive,
      role: user.role,
      rating: Number(user.rating),
      totalRatings: user.totalRatings,
      region: user.region,
      city: user.city,
      district: user.district,
      birthDate: user.birthDate || null,
      gender: user.gender,
      language: user.language,
      country: user.country,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
