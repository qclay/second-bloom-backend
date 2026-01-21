import { IsString, IsUUID } from 'class-validator';

export class JoinConversationDto {
  @IsString()
  @IsUUID()
  conversationId!: string;
}
