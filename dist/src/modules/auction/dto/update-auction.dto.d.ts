import { CreateAuctionDto } from './create-auction.dto';
import { AuctionStatus } from '@prisma/client';
declare const UpdateAuctionDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAuctionDto>>;
export declare class UpdateAuctionDto extends UpdateAuctionDto_base {
    startPrice?: number;
    bidIncrement?: number;
    minBidAmount?: number;
    endTime?: string;
    durationHours?: number;
    autoExtend?: boolean;
    extendMinutes?: number;
    status?: AuctionStatus;
}
export {};
