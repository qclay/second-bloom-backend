import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    example: 'Logged out successfully',
    description: 'Success message',
    type: String,
  })
  message!: string;
}
