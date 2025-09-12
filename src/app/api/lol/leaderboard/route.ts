import { TLeaderboardApiResponse, TLeaderboardPlayer } from '@/types/LeaderboardApiTypes';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { lolCache } from '@/utils/cache';
import { fetchRegionRank } from '@/utils/leaderboardUtils';

export async function GET() {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Starting leaderboard request`);

  try {
    const cacheKey = 'kc-leaderboard';

    let leaderboard = lolCache.get<TPlayerLeaderboard[]>(cacheKey);

    if (!leaderboard) {
      console.log(`[${requestId}] Cache miss, fetching from API`);

      const apiUrl = 'https://dpm.lol/v1/leaderboards/custom/29e4e979-4c43-4ac7-bf5f-5f5195551f66';
      console.log(`[${requestId}] Fetching from: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      console.log(`[${requestId}] API response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = (await response.json()) as unknown;

      if (
        !payload ||
        typeof payload !== 'object' ||
        !Array.isArray((payload as TLeaderboardApiResponse).players)
      ) {
        throw new Error('Unexpected KC leaderboard response shape');
      }

      let leaderboardIndex = 1;
      const uniquePlayersMap = (payload as TLeaderboardApiResponse).players.reduce(
        (acc: Map<string, TPlayerLeaderboard>, player: TLeaderboardPlayer) => {
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
      console.log(`[${requestId}] Created leaderboard with ${leaderboard.length} unique players`);

      try {
        console.log(`[${requestId}] Fetching region ranks...`);
        const startTime = Date.now();
        leaderboard = await fetchRegionRank(leaderboard);
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] Region ranks fetched successfully in ${duration}ms`);
      } catch (e) {
        console.error(`[${requestId}] fetchRegionRank failed, returning base leaderboard:`, e);
        // Log the specific error details
        if (e instanceof Error) {
          console.error(`[${requestId}] Error name: ${e.name}, message: ${e.message}`);
          console.error(`[${requestId}] Error stack:`, e.stack);
        }
      }

      console.log(`[${requestId}] Caching leaderboard with ${leaderboard.length} players`);
      lolCache.set(cacheKey, leaderboard, 30);
    } else {
      console.log(
        `[${requestId}] Cache hit, returning cached data with ${leaderboard.length} players`,
      );
    }

    console.log(`[${requestId}] Request completed successfully`);
    return Response.json(leaderboard);
  } catch (error) {
    console.error(`[${requestId}] Error fetching LoL leaderboard:`, error);

    return Response.json({ error: 'Failed to fetch LoL leaderboard' }, { status: 500 });
  }
}
