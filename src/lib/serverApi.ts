import { TChampion } from '@/types/ChampionType';
import { TLeaderboardApiResponse, TLeaderboardPlayer } from '@/types/LeaderboardApiTypes';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { fetchRegionRank } from '@/utils/leaderboardUtils';
import { logger } from '@/utils/logger';
import { Strings } from '@/utils/stringUtils';

/**
 * Server-side function to fetch the latest LoL version directly from Data Dragon.
 * @returns {Promise<string>} A promise of the latest LoL version.
 */
export async function getLatestLolVersion(): Promise<string> {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
    next: {
      revalidate: 1800, // 30 minutes cache
      tags: ['lol-version'],
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch latest LoL version: ${response.status}`);
  }

  const versions = await response.json();

  if (!Array.isArray(versions) || typeof versions[0] !== 'string') {
    throw new Error('Unexpected Data Dragon response shape');
  }

  return versions[0];
}

// Types from the API route
interface ChampionImageData {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ChampionApiData {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  image: ChampionImageData;
  tags: string[];
  partype: string;
  stats: Record<string, number>;
}

interface ChampionsApiResponse {
  type: string;
  format: string;
  version: string;
  data: Record<string, ChampionApiData>;
}

/**
 * Server-side function to fetch the list of champions from a specific LoL version.
 * @param lolVersion The LoL version to fetch champions from.
 * @returns {Promise<TChampion[]>} A promise with the list of champions.
 */
export async function getChampionsByVersion(lolVersion: string): Promise<TChampion[]> {
  const response = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${lolVersion}/data/fr_FR/champion.json`,
    {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      next: {
        revalidate: 604800, // 7 days
        tags: ['lol-champions', `champions-${lolVersion}`],
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch champions for version ${lolVersion}: ${response.status}`);
  }

  const championsData = (await response.json()) as ChampionsApiResponse;

  const champions: TChampion[] = Object.keys(championsData.data).map((key) => {
    const champion = championsData.data[key];
    return {
      name: champion.name,
      id: champion.id,
      image: `https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/champion/${champion.image.full}`,
    };
  });

  return champions;
}

/**
 * Server-side function to fetch the latest champions.
 * @returns {Promise<TChampion[]>} A promise with the list of latest champions.
 */
export async function getLatestChampions(): Promise<TChampion[]> {
  const latestVersion = await getLatestLolVersion();
  return getChampionsByVersion(latestVersion);
}

/**
 * Server-side function to fetch KC leaderboard data.
 * @returns {Promise<TPlayerLeaderboard[]>} A promise with the leaderboard data.
 */
export async function getKcLeaderboard(): Promise<TPlayerLeaderboard[]> {
  // During build time, return empty array to avoid network calls
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    return [];
  }

  const log = logger.child('server-api:leaderboard');
  try {
    log.info('Fetching leaderboard from API');

    // Fetch from the external leaderboard API
    const response = await fetch(
      'https://dpm.lol/v1/leaderboards/custom/29e4e979-4c43-4ac7-bf5f-5f5195551f66',
      {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
        next: {
          revalidate: 1800, // 30 minutes cache
          tags: ['lol-leaderboard'],
        },
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
            next: {
              revalidate: 1800,
              tags: ['lol-leaderboard'],
            },
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
        log.error('Failed to fetch Hazel Alt data:', error);
      }
    }

    const players = Array.from(uniquePlayersMap.values());
    log.info(`Created leaderboard with ${players.length} unique players`);

    // Fetch region ranks
    log.info('Fetching region ranks...');
    const startTime = Date.now();
    const playersWithRegionRank = await fetchRegionRank(players);
    const fetchTime = Date.now() - startTime;
    log.info(`Region ranks fetched successfully in ${fetchTime}ms`);

    return playersWithRegionRank;
  } catch (error) {
    log.error('Failed to fetch KC leaderboard:', error);
    return [];
  }
}
