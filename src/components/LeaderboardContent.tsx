'use client';

import { useFetchKcLeaderboard } from '@/hooks/reactQuery/queries';

export default function LeaderboardContent() {
  const { data: leaderboard } = useFetchKcLeaderboard();
  console.log('🚀 ~ LeaderboardContent ~ leaderboard:', leaderboard);

  return (
    <div className="flex flex-col gap-2">
      {leaderboard?.map((player) => (
        <div key={player.kcLeaderboardPosition + player.player}>
          #{player.kcLeaderboardPosition}. {player.player}:{' '}
          <span className="capitalize">{player.tier.toLowerCase()}</span> {player.lp}LP [Rank:{' '}
          {player.regionRank}]
        </div>
      ))}
    </div>
  );
}
