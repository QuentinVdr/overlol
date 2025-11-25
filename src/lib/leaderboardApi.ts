import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { TRiotAccount } from '@/types/RiotAccountType';
import { logger } from '@/utils/logger';
import { unstable_cache } from 'next/cache';

const kcPlayerList: { [key: string]: TRiotAccount[] } = {
  // KC LEC Roster
  Canna: [{ riotPseudo: 'K C', tagLine: 'kcwin' }],
  Yike: [{ riotPseudo: 'KC Yiken', tagLine: '1111' }],
  Vladi: [{ riotPseudo: 'dmsdklb', tagLine: 'vivi' }],
  Caliste: [
    { riotPseudo: 'KC NEXT ADKING', tagLine: 'EUW' },
    { riotPseudo: 'I NEED SOLOQ', tagLine: 'EUW' },
  ],
  Targamas: [{ riotPseudo: 'Targamas', tagLine: '5555' }],
  // KC Blue Roster
  Maynter: [
    { riotPseudo: 'Maynter', tagLine: 'EUW' },
    { riotPseudo: 'vovalaclasse', tagLine: 'EUW' },
  ],
  '3XA': [
    { riotPseudo: '永遠の拷問', tagLine: 'xox' },
    { riotPseudo: 'Atomic Habits', tagLine: '2809' },
    { riotPseudo: 'Requiem', tagLine: '1302' },
  ],
  Yukino: [
    { riotPseudo: 'yukino cat', tagLine: 'blue' },
    { riotPseudo: 'yukino cat', tagLine: 'cat' },
  ],
  // KC BS Roster
  Tao: [{ riotPseudo: 'Loose Ends999', tagLine: 'EUW' }],
  BAASHH: [{ riotPseudo: 'TTV BAASHH', tagLine: 'EUW' }],
  MathisV: [{ riotPseudo: 'MathisV', tagLine: 'ARCHE' }],
  Hazel: [
    { riotPseudo: 'Antarctica', tagLine: 'S B' },
    { riotPseudo: 'Hazel', tagLine: 'KCorp' },
    { riotPseudo: 'one last dance', tagLine: '114' },
    { riotPseudo: '114', tagLine: '1405' },
  ],
  Nsurr: [
    { riotPseudo: 'TripleMonstre', tagLine: 'EUWFR' },
    { riotPseudo: 'Full Drip Nsurr', tagLine: 'EUW' },
    { riotPseudo: 'Nsurr', tagLine: 'EUWFR' },
  ],
};

/**
 * Internal function to fetch and process KC leaderboard data.
 * This does all the heavy lifting: API calls, data transformation, region rank fetching.
 */
async function fetchAndProcessKcLeaderboard(): Promise<TPlayerLeaderboard[]> {
  const log = logger.child('leaderboard-service:leaderboard');
  log.debug('Fetching and processing KC leaderboard data');

  const allGroups = await Promise.all(
    Object.keys(kcPlayerList).map((kcPlayer) => getPlayerLeaderboardData(kcPlayer)),
  );

  return allGroups.filter((player): player is TPlayerLeaderboard => player !== undefined);
}

async function getPlayerLeaderboardData(kcPlayer: string): Promise<TPlayerLeaderboard | undefined> {
  const log = logger.child('leaderboard-service:player-data');

  // Fetch all accounts in parallel
  const accountPromises = kcPlayerList[kcPlayer].map(async (account) => {
    try {
      return await fetchAccountInfo(account);
    } catch (error) {
      log.error(`Failed to fetch data for ${account.riotPseudo}#${account.tagLine}:`, error);
      return null;
    }
  });

  const results = await Promise.all(accountPromises);

  let bestAccount: TPlayerLeaderboard | undefined = undefined;
  for (const playerData of results) {
    if (playerData && (!bestAccount || playerData.lp > bestAccount.lp)) {
      bestAccount = playerData;
    }
  }

  if (bestAccount) {
    bestAccount.playerName = kcPlayer;
  }

  return bestAccount;
}

async function fetchAccountInfo(riotAccount: TRiotAccount): Promise<TPlayerLeaderboard> {
  const log = logger.child('api:leaderboard:fetchAccountInfo');

  const url = `https://op.gg/lol/summoners/euw/${encodeURIComponent(
    riotAccount.riotPseudo,
  )}-${encodeURIComponent(riotAccount.tagLine)}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
    headers: {
      Accept: 'text/html',
      'Accept-Encoding': 'gzip, deflate',
    },
  });

  if (!response.ok) {
    log.error(
      `Failed to fetch account info for ${riotAccount.riotPseudo}#${riotAccount.tagLine}: HTTP ${response.status} ${response.statusText}`,
    );
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const { regionRank, rank, lp } = extractData(html);

  log.debug(
    `Found data for ${riotAccount.riotPseudo}#${riotAccount.tagLine}: ${rank || 'N/A'} ${lp !== null ? lp + ' LP' : ''} - Region Rank: ${regionRank || 'N/A'}`,
  );

  return {
    inGameName: riotAccount.riotPseudo,
    tagLine: riotAccount.tagLine,
    rank: rank || 'Unranked',
    lp: lp ?? 0,
    regionRank,
  } as TPlayerLeaderboard;
}

const formatRank = (tierString: string): string => {
  if (!tierString) return '';
  return tierString
    .trim()
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
};

const REGEX_LADDER_RANK = /Ladder Rank\s*<span[^>]*>([\d,]+)<\/span>/;
const REGEX_RANK =
  /<strong[^>]*first-letter:uppercase[^>]*>([^<]+)<\/strong><span[^>]*>([\d,]+)<!--[^>]*-->\s*LP<\/span>/;

const extractData = (html: string): { regionRank: string; rank: string; lp: number | null } => {
  const regionRank = REGEX_LADDER_RANK.exec(html)?.[1] ?? '';

  const htmlRankInfo = REGEX_RANK.exec(html);
  if (htmlRankInfo) {
    return {
      regionRank,
      rank: formatRank(htmlRankInfo[1]),
      lp: parseInt(htmlRankInfo[2].replace(/,/g, ''), 10),
    };
  }

  return { regionRank, rank: '', lp: null };
};

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
  try {
    return await getCachedKcLeaderboard();
  } catch (error) {
    const log = logger.child('leaderboard-service:leaderboard');
    log.error('Failed to fetch KC leaderboard:', error);
    return [];
  }
}
