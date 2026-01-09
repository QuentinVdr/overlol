import { getKcLeaderboard } from '@/lib/leaderboardApi';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';

export const dynamic = 'force-dynamic';

export default async function LeaderboardOverlay() {
  let leaderboard: TPlayerLeaderboard[];

  try {
    leaderboard = await getKcLeaderboard();
  } catch (error) {
    console.warn('Failed to fetch leaderboard data:', error);
    leaderboard = [];
  }

  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) =>
      (parseInt(a.regionRank.replace(/,/g, '')) || Infinity) -
      (parseInt(b.regionRank.replace(/,/g, '')) || Infinity),
  );

  return (
    <div className="h-174 absolute left-[72px] top-[148px] flex w-[454px] flex-col justify-evenly gap-2 bg-zinc-900/40 text-[20px] font-bold text-white">
      {sortedLeaderboard.length > 0 ? (
        sortedLeaderboard.map((player, index) => (
          <div key={player.playerName}>
            #{index + 1}. {player.playerName}:{' '}
            <span className="capitalize">{player.rank.toLowerCase()}</span>
            {player.rank !== 'Unranked' && ` ${player.lp}LP [Rank: ${player.regionRank}]`}
          </div>
        ))
      ) : (
        <div className="self-center">No leaderboard data available.</div>
      )}
    </div>
  );
}
