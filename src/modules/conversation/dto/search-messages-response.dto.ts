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
}

export class SearchMessagesResponseDto {
  @ApiProperty({
    type: [SearchMessagesResultDto],
    description: 'Matching messages with conversation title',
  })
  data!: SearchMessagesResultDto[];
}
