import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import * as cheerio from 'cheerio';
import { logger } from './logger';

const log = logger.child('api:leaderboard:fetchRegionRank');

/**
 * Fetch regional rank for a players.
 * @param players The players to fetch regional rank for.
 * @return {Promise<TPlayerLeaderboard[]>} A promise with the players including their regional rank.
 */
export const fetchRegionRank = async (
  players: TPlayerLeaderboard[],
): Promise<TPlayerLeaderboard[]> => {
  log.info(`Starting fetchRegionRank for ${players.length} players`);

  const fetchPlayerRank = async (
    player: TPlayerLeaderboard,
    index: number,
  ): Promise<TPlayerLeaderboard> => {
    const url = `https://op.gg/lol/summoners/euw/${encodeURIComponent(
      player.inGameName,
    )}-${encodeURIComponent(player.tagLine)}`;

    log.debug(`Fetching: ${index + 1}/${players.length} ${player.inGameName}: ${url}`);

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OverLoL/1.0)' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      log.debug(`Response for ${player.inGameName}: ${response.status}`);
      const html = await response.text();
      const $ = cheerio.load(html);

      const selectors = [
        '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(2) > a > span > span',
        '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(3) > a > span > span',
      ];

      const regionRank =
        selectors.map((selector) => $(selector).text().trim()).find((text) => text !== '') || '';

      log.debug(`Found region rank for ${player.inGameName}: ${regionRank}`);
      return { ...player, regionRank };
    } catch (error) {
      log.error(`Error fetching rank for ${player.inGameName}:`, error);
      return { ...player, regionRank: '' };
    }
  };

  const results = await Promise.all(players.map((player, index) => fetchPlayerRank(player, index)));

  log.info(`Completed fetchRegionRank for all ${players.length} players`);
  return results;
};
