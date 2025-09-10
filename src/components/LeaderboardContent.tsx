'use client';

import { useFetchKcLeaderboard } from '@/hooks/reactQuery/queries';

export default function LeaderboardContent() {
  const { data: leaderboard } = useFetchKcLeaderboard();

  return (
    <div className="absolute top-[148px] left-[72px] flex h-174 w-[454px] flex-col justify-around gap-2 bg-zinc-900/40 text-[21px] font-bold text-white">
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
