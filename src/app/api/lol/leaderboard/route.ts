import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { lolCache } from '@/utils/cache';
import { fetchRegionRank } from '@/utils/leaderboardUtils';

export async function GET() {
  try {
    const cacheKey = 'kc-leaderboard';

    let leaderboard = lolCache.get<TPlayerLeaderboard[]>(cacheKey);

    if (!leaderboard) {
      const response = await fetch(
        'https://dpm.lol/v1/leaderboards/custom/29e4e979-4c43-4ac7-bf5f-5f5195551f66',
        {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = (await response.json()) as unknown;

      if (!payload || typeof payload !== 'object' || !Array.isArray((payload as any).players)) {
        throw new Error('Unexpected Data Dragon response shape');
      }

      let leaderboardIndex = 1;
      const uniquePlayersMap = (payload as any).players.reduce(
        (acc: Map<string, TPlayerLeaderboard>, player: any) => {
          const displayName = player.displayName;
          if (!acc.has(displayName)) {
            acc.set(displayName, {
              team: player.team,
              player: displayName,
              inGameName: player.gameName,
              tagLine: player.tagLine,
              kcLeaderboardPosition: leaderboardIndex,
              rank: player.rank.rank,
              tier: player.rank.tier,
              lp: player.rank.leaguePoints,
              isLive: player.isLive,
            });
            leaderboardIndex++;
          }
          return acc;
        },
        new Map<string, TPlayerLeaderboard>(),
      );

      leaderboard = Array.from(uniquePlayersMap.values());

      try {
        leaderboard = await fetchRegionRank(leaderboard);
      } catch (e) {
        console.warn('fetchRegionRank failed, returning base leaderboard:', e);
      }

      lolCache.set(cacheKey, leaderboard, 30);
    }

    return Response.json(leaderboard);
  } catch (error) {
    console.error('Error fetching LoL latest version:', error);
    return Response.json({ error: 'Failed to fetch latest version' }, { status: 500 });
  }
}
