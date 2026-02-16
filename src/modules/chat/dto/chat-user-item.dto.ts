import { ApiProperty } from '@nestjs/swagger';

export class ChatUserItemDto {
  @ApiProperty({ description: 'User ID' })
  id!: string;

  @ApiProperty({ description: 'Phone number', example: '+998901234567' })
  phoneNumber!: string;

  @ApiProperty({ nullable: true, description: 'First name' })
  firstName!: string | null;

  @ApiProperty({ nullable: true, description: 'Last name' })
  lastName!: string | null;

  @ApiProperty({
    description: 'Number of active products',
    example: 3,
  })
  productCount!: number;
}
