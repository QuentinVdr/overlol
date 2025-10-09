import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { logger } from './logger';

const log = logger.child('api:leaderboard:fetchRegionRank');

const extractRegionRank = (html: string): string => {
  // Pattern supports numbers with commas (e.g., "1,234")
  const match = /Ladder Rank\s+<span[^>]*>([\d,]+)<\/span>/.exec(html);
  return match?.[1] ?? '';
};

/**
 * Fetch regional rank for players with batching to reduce memory usage
 * @param players The players to fetch regional rank for
 * @return {Promise<TPlayerLeaderboard[]>} A promise with the players including their regional rank
 */
export const fetchRegionRank = async (
  players: TPlayerLeaderboard[],
): Promise<TPlayerLeaderboard[]> => {
  const numberOfPlayers = players.length;
  log.info(`Starting fetchRegionRank for ${numberOfPlayers} players`);

  const fetchPlayerRank = async (
    player: TPlayerLeaderboard,
    index: number,
    total: number,
  ): Promise<TPlayerLeaderboard> => {
    const url = `https://op.gg/lol/summoners/euw/${encodeURIComponent(
      player.inGameName,
    )}-${encodeURIComponent(player.tagLine)}`;

    log.debug(`Fetching: ${index + 1}/${total} ${player.inGameName}#${player.tagLine}`);

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: {
          Accept: 'text/html',
          'Accept-Encoding': 'gzip, deflate',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      const regionRank = extractRegionRank(html);

      log.debug(
        `Found region rank for ${player.inGameName}#${player.tagLine}: ${regionRank || 'N/A'}`,
      );

      return { ...player, regionRank };
    } catch (error) {
      log.error(`Error fetching rank for ${player.inGameName}#${player.tagLine}:`, error);
      return { ...player, regionRank: '' };
    }
  };

  const results = await Promise.all(
    players.map((player, index) => fetchPlayerRank(player, index, numberOfPlayers)),
  );

  log.info(`Completed fetchRegionRank for all ${numberOfPlayers} players`);
  return results;
};
