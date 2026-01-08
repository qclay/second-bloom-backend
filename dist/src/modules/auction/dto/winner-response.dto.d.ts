export declare class WinnerResponseDto {
    rank: number;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
    avatarUrl: string | null;
    highestBid: number;
    bidCount: number;
}
export declare class WinnersResponseDto {
    winners: WinnerResponseDto[];
}
