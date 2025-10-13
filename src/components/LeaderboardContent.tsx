import { getKcLeaderboard } from '@/lib/leaderboardApi';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';

export default async function LeaderboardContent() {
  let leaderboard: TPlayerLeaderboard[];

  try {
    leaderboard = await getKcLeaderboard();
  } catch (error) {
    console.warn('Failed to fetch leaderboard data:', error);
    leaderboard = [];
  }

  // Sort leaderboard by LP in descending order
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.lp - a.lp);

  return (
    <div className="absolute top-[148px] left-[72px] flex h-174 w-[454px] flex-col justify-around gap-2 bg-zinc-900/40 text-[21px] font-bold text-white">
      {sortedLeaderboard.length > 0 ? (
        sortedLeaderboard.map((player, index) => (
          <div key={player.player}>
            #{index + 1}. {player.player}:{' '}
            <span className="capitalize">{player.tier.toLowerCase()}</span> {player.lp}LP [Rank:{' '}
            {player.regionRank}]
          </div>
        ))
      ) : (
        <div>No leaderboard data available.</div>
      )}
    </div>
  );
}
