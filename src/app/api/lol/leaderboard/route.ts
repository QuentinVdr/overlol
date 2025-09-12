import { TLeaderboardApiResponse, TLeaderboardPlayer } from '@/types/LeaderboardApiTypes';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { CACHE_DURATIONS, CACHE_TAGS, createCachedFunction } from '@/utils/cacheUtils';
import { fetchRegionRank } from '@/utils/leaderboardUtils';
import { logger } from '@/utils/logger';

const log = logger.child('api:leaderboard');

const getCachedLeaderboard = createCachedFunction(
  (): Promise<TPlayerLeaderboard[]> => {
    log.info('Fetching leaderboard from API');

    return fetch('https://dpm.lol/v1/leaderboards/custom/29e4e979-4c43-4ac7-bf5f-5f5195551f66', {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json() as Promise<TLeaderboardApiResponse>;
      })
      .then((payload) => {
        if (!payload?.players || !Array.isArray(payload.players)) {
          throw new Error('Unexpected KC leaderboard response shape');
        }

        let leaderboardIndex = 1;
        const uniquePlayersMap = payload.players.reduce(
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

        const leaderboard = Array.from(uniquePlayersMap.values());
        log.info(`Created leaderboard with ${leaderboard.length} unique players`);

        log.info('Fetching region ranks...');
        const startTime = Date.now();

        return fetchRegionRank(leaderboard)
          .then((updatedLeaderboard) => {
            const duration = Date.now() - startTime;
            log.info(`Region ranks fetched successfully in ${duration}ms`);
            return updatedLeaderboard;
          })
          .catch((error) => {
            log.warn('Failed to fetch region ranks, returning base leaderboard', error);
            return leaderboard;
          });
      });
  },
  ['kc-leaderboard'],
  {
    revalidate: CACHE_DURATIONS.LEADERBOARD,
    tags: [CACHE_TAGS.LEADERBOARD],
    logPrefix: 'leaderboard-cache',
  },
);

export function GET() {
  return getCachedLeaderboard()
    .then((leaderboard) => {
      log.debug(`Returning ${leaderboard.length} players`);
      return Response.json(leaderboard);
    })
    .catch((error) => {
      log.error('Failed to get leaderboard', error);
      return Response.json({ error: 'Failed to fetch LoL leaderboard' }, { status: 500 });
    });
}
