import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TelegramLinkContactDto {
  @ApiProperty({
    example: '123456789',
    description: 'Telegram user ID',
  })
  @IsString()
  @IsNotEmpty()
  telegramId!: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Verified phone number from Telegram contact (E.164 format)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'phoneNumber must be a valid E.164 phone number',
  })
  phoneNumber!: string;

  @ApiProperty({
    example: 'your_bot_secret_here',
    description: 'Shared secret to authenticate the request from the bot',
  })
  @IsString()
  @IsNotEmpty()
  botSecret!: string;

  @ApiPropertyOptional({
    example: 'john_doe',
    description: 'Telegram username',
  })
  @IsOptional()
  @IsString()
  telegramUsername?: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'First name from Telegram',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name from Telegram',
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}
