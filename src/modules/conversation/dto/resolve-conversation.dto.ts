import { IsUUID, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationContextType } from '../constants/conversation-context.enum';

export class ResolveConversationDto {
    @ApiProperty({
        enum: ConversationContextType,
        description: 'The business context of the conversation',
        example: ConversationContextType.PRODUCT,
    })
    @IsEnum(ConversationContextType)
    context!: ConversationContextType;

    @ApiPropertyOptional({
        description: 'Product ID (required for PRODUCT and AUCTION_BID contexts)',
        example: 'clx1234567890abcdef',
    })
    @IsUUID()
    @IsOptional()
    productId?: string;

    @ApiPropertyOptional({
        description: 'Order ID (required for ORDER context)',
        example: 'clx1234567890abcdef',
    })
    @IsUUID()
    @IsOptional()
    orderId?: string;

    @ApiPropertyOptional({
        description: 'The other user ID (required for AUCTION_BID, optional for PRODUCT)',
        example: 'clx1234567890abcdef',
    })
    @IsUUID()
    @IsOptional()
    targetUserId?: string;

    @ApiPropertyOptional({
        description: 'Optional metadata to be stored in the conversation',
        example: { bidAmount: 150000 },
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}
