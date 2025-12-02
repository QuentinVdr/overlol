import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { TRiotAccount } from '@/types/RiotAccountType';
import { logger } from '@/utils/logger';
import { unstable_cache } from 'next/cache';

const kcPlayerList: { [key: string]: TRiotAccount[] } = {
  // KC LEC Roster
  Canna: [{ riotPseudo: 'K C', tagLine: 'kcwin', region: 'EUW' }],
  Yike: [{ riotPseudo: 'KC Yiken', tagLine: '1111', region: 'EUW' }],
  Vladi: [{ riotPseudo: 'dmsdklb', tagLine: 'vivi', region: 'EUW' }],
  Caliste: [
    { riotPseudo: 'KC NEXT ADKING', tagLine: 'EUW', region: 'EUW' },
    { riotPseudo: 'I NEED SOLOQ', tagLine: 'EUW', region: 'EUW' },
  ],
  Targamas: [{ riotPseudo: 'Targamas', tagLine: '5555', region: 'EUW' }],
  // KC Blue Roster
  Maynter: [
    { riotPseudo: 'Maynter', tagLine: 'EUW', region: 'EUW' },
    { riotPseudo: 'vovalaclasse', tagLine: 'EUW', region: 'EUW' },
  ],
  Yukino: [
    { riotPseudo: 'yukino cat', tagLine: 'blue', region: 'EUW' },
    { riotPseudo: 'yukino cat', tagLine: 'cat', region: 'EUW' },
  ],
  Kamiloo: [
    { riotPseudo: 'Limitless limits', tagLine: 'FIRE', region: 'EUW' },
    { riotPseudo: 'TODOROKI RAICHI', tagLine: 'rank1', region: 'EUW' },
    { riotPseudo: 'Labubu IRL', tagLine: 'macha', region: 'EUW' },
  ],
  '3XA': [
    { riotPseudo: '永遠の拷問', tagLine: 'xox', region: 'EUW' },
    { riotPseudo: 'Atomic Habits', tagLine: '2809', region: 'EUW' },
    { riotPseudo: 'Requiem', tagLine: '1302', region: 'EUW' },
  ],
  Prime: [
    { riotPseudo: 'Céleste', tagLine: '6162', region: 'EUW' },
    { riotPseudo: 'POBC', tagLine: '6162', region: 'EUW' },
  ],
  // KC BS Roster
  Tao: [{ riotPseudo: 'xhtao', tagLine: '3100', region: 'EUW' }],
  BAASHH: [{ riotPseudo: 'TTV BAASHH', tagLine: 'EUW', region: 'EUW' }],
  MathisV: [{ riotPseudo: 'MathisV', tagLine: 'ARCHE', region: 'EUW' }],
  Hazel: [
    { riotPseudo: 'Antarctica', tagLine: 'S B', region: 'EUW' },
    { riotPseudo: 'Hazel', tagLine: 'KCorp', region: 'EUW' },
    { riotPseudo: 'one last dance', tagLine: '114', region: 'EUW' },
    { riotPseudo: '114', tagLine: '1405', region: 'EUW' },
  ],
  Nsurr: [
    { riotPseudo: 'TripleMonstre', tagLine: 'EUWFR', region: 'EUW' },
    { riotPseudo: 'Full Drip Nsurr', tagLine: 'EUW', region: 'EUW' },
    { riotPseudo: 'Nsurr', tagLine: 'EUWFR', region: 'EUW' },
  ],
};

/**
 * Internal function to fetch and process KC leaderboard data.
 * This does all the heavy lifting: API calls, data transformation, region rank fetching.
 */
async function fetchAndProcessKcLeaderboard(): Promise<TPlayerLeaderboard[]> {
  const log = logger.child('leaderboard-service:leaderboard');
  log.info('Fetching and processing KC leaderboard data');

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
  let bestAccountRank: number = Infinity;
  for (const playerData of results) {
    if (
      playerData &&
      (!bestAccount || parseInt(playerData.regionRank.replaceAll(',', '')) < bestAccountRank)
    ) {
      bestAccount = playerData;
      bestAccountRank = parseInt(playerData.regionRank.replaceAll(',', ''));
    }
  }

  if (bestAccount) {
    bestAccount.playerName = kcPlayer;
  }
  log.debug(`${kcPlayer} bestAccount:`, bestAccount);

  return bestAccount;
}

async function fetchAccountInfo(riotAccount: TRiotAccount): Promise<TPlayerLeaderboard> {
  const log = logger.child('api:leaderboard:fetchAccountInfo');

  const region = riotAccount.region.toLowerCase();
  const url = `https://op.gg/lol/summoners/${region}/${encodeURIComponent(
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
