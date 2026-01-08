export declare class LeaderboardEntryDto {
    rank: number;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
    avatarUrl: string | null;
    highestBid: number;
    bidCount: number;
    totalBidAmount: number;
    lastBidAt: Date | null;
}
export declare class LeaderboardResponseDto {
    leaderboard: LeaderboardEntryDto[];
    totalParticipants: number;
}
