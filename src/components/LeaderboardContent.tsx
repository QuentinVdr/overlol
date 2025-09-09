'use client';

import { useFetchKcLeaderboard } from '@/hooks/reactQuery/queries';

export default function LeaderboardContent() {
  const { data: leaderboard } = useFetchKcLeaderboard();

  return (
    <div className="absolute top-[146px] left-[69px] flex flex-col gap-2 text-xl font-bold text-white">
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
