export type TLeaderboardPlayer = {
  displayName: string;
  team: string;
  gameName: string;
  tagLine: string;
  rank: {
    rank: string;
    tier: string;
    leaguePoints: number;
  };
  isLive: boolean;
};

export type TLeaderboardApiResponse = {
  players: TLeaderboardPlayer[];
};
