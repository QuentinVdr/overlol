import { TLeaderboardApiResponse, TLeaderboardPlayer } from '@/types/LeaderboardApiTypes';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { fetchRegionRank } from '@/utils/leaderboardUtils';
import { logger } from '@/utils/logger';
import { Strings } from '@/utils/stringUtils';
import { unstable_cache } from 'next/cache';

/**
 * Internal function to fetch and process KC leaderboard data.
 * This does all the heavy lifting: API calls, data transformation, region rank fetching.
 */
async function fetchAndProcessKcLeaderboard(): Promise<TPlayerLeaderboard[]> {
  const log = logger.child('leaderboard-service:leaderboard');

  log.info('Fetching leaderboard from API');

  // Fetch from the external leaderboard API
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

  const payload = (await response.json()) as TLeaderboardApiResponse;

  if (!payload?.players || !Array.isArray(payload.players)) {
    throw new Error('Unexpected KC leaderboard response shape');
  }

  // Create unique players map
  const uniquePlayersMap = payload.players.reduce(
    (acc: Map<string, TPlayerLeaderboard>, player: TLeaderboardPlayer) => {
      const displayName = player.displayName;
      if (!acc.has(displayName)) {
        acc.set(displayName, {
          team: player.team,
          player: displayName,
          inGameName: player.gameName,
          tagLine: player.tagLine,
          rank: player.rank.rank,
          tier: player.rank.tier,
          lp: player.rank.leaguePoints,
          regionRank: '', // Will be populated by fetchRegionRank
        });
      }
      return acc;
    },
    new Map<string, TPlayerLeaderboard>(),
  );

  // Add Hazel Alt if environment variables are set
  const riotApiKey = process.env.NEXT_RIOT_API_KEY;
  const encryptedPUUID = process.env.NEXT_HAZEL_ALT_PUUID;

  if (Strings.isNotBlank(riotApiKey) && Strings.isNotBlank(encryptedPUUID)) {
    try {
      const riotResponse = await fetch(
        `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${encryptedPUUID}`,
        {
          headers: {
            accept: 'application/json',
            'X-Riot-Token': riotApiKey!,
          },
          signal: AbortSignal.timeout(5000),
        },
      );

      if (riotResponse.ok) {
        const riotData = await riotResponse.json();
        if (Array.isArray(riotData) && riotData[0]) {
          const hazelData = riotData[0];
          uniquePlayersMap.set('Hazel Alt', {
            team: 'KC',
            player: 'Hazel Alt',
            inGameName: 'Hazel Alt',
            tagLine: 'ALT',
            rank: hazelData.rank || 'I',
            tier: hazelData.tier || 'CHALLENGER',
            lp: hazelData.leaguePoints || 0,
            regionRank: '',
          });
        }
      }
    } catch (error) {
      log.warn('Failed to fetch Hazel Alt data:', error);
    }
  }

  const players = Array.from(uniquePlayersMap.values());
  log.info(`Created leaderboard with ${players.length} unique players`);

  // Fetch region ranks - this is the most expensive operation
  log.info('Fetching region ranks...');
  const startTime = Date.now();
  const playersWithRegionRank = await fetchRegionRank(players);
  const fetchTime = Date.now() - startTime;
  log.info(`Region ranks fetched successfully in ${fetchTime}ms`);

  return playersWithRegionRank;
}

/**
 * Cached version of KC leaderboard fetching.
 * Uses unstable_cache to avoid expensive data transformation and region rank fetching
 * on every request when data hasn't changed.
 */
const getCachedKcLeaderboard = unstable_cache(
  fetchAndProcessKcLeaderboard,
  ['kc-leaderboard'], // cache key
  {
    revalidate: 1800, // 30 minutes cache
    tags: ['lol-leaderboard'],
  },
);

/**
 * Server-side function to fetch KC leaderboard data.
 * Uses unstable_cache to cache the fully processed result including region ranks.
 * @returns {Promise<TPlayerLeaderboard[]>} A promise with the leaderboard data.
 */
export async function getKcLeaderboard(): Promise<TPlayerLeaderboard[]> {
  // During build time, return empty array to avoid network calls
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    return [];
  }

  try {
    return await getCachedKcLeaderboard();
  } catch (error) {
    const log = logger.child('leaderboard-service:leaderboard');
    log.error('Failed to fetch KC leaderboard:', error);
    return [];
  }
}
