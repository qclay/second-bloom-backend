export declare class ParticipantResponseDto {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
    avatarUrl: string | null;
    bidCount: number;
    highestBid: number;
    totalBidAmount: number;
    lastBidAt: Date | null;
}
export declare class ParticipantsResponseDto {
    participants: ParticipantResponseDto[];
    totalParticipants: number;
}
