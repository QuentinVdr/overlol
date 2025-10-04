import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import * as cheerio from 'cheerio';
import { logger } from './logger';

const log = logger.child('api:leaderboard:fetchRegionRank');

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

    log.debug(`Fetching: ${index + 1}/${total} ${player.inGameName}`);

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

      // Load with minimal options to reduce memory usage
      const $ = cheerio.load(html, { xml: false });

      const selectors = [
        '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(2) > a > span > span',
        '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(3) > a > span > span',
      ];

      let regionRank = '';
      for (const selector of selectors) {
        const text = $(selector).text().trim();
        if (text) {
          regionRank = text;
          break;
        }
      }

      log.debug(`Found region rank for ${player.inGameName}: ${regionRank || 'N/A'}`);

      // Explicitly clean up Cheerio instance
      $.root().empty();

      return { ...player, regionRank };
    } catch (error) {
      log.error(`Error fetching rank for ${player.inGameName}:`, error);
      return { ...player, regionRank: '' };
    }
  };

  const results = await Promise.all(
    players.map((player, index) => fetchPlayerRank(player, index, numberOfPlayers)),
  );

  log.info(`Completed fetchRegionRank for all ${numberOfPlayers} players`);
  return results;
};
