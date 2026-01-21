import { IsString, IsUUID } from 'class-validator';

export class JoinAuctionDto {
  @IsString()
  @IsUUID()
  auctionId!: string;
}
