import { ApiProperty } from '@nestjs/swagger';
import { ConversationMessageResponseDto } from './message-response.dto';

export class SearchMessagesResultDto {
  @ApiProperty({
    type: ConversationMessageResponseDto,
    description: 'The message',
  })
  message!: ConversationMessageResponseDto;

  @ApiProperty({
    example: 'John Doe',
    description:
      'Display name of the conversation (other participant or order label)',
  })
  conversationTitle!: string;

  @ApiProperty({
    example: 2,
    description: 'Number of unread messages in this conversation for the user',
  })
  unreadCount!: number;
}

export class SearchMessagesResponseDto {
  @ApiProperty({
    type: [SearchMessagesResultDto],
    description: 'Matching messages with conversation title',
  })
  data!: SearchMessagesResultDto[];
}
