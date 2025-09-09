import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import * as cheerio from 'cheerio';

/**
 * Fetch regional rank for a players.
 * @param players The players to fetch regional rank for.
 * @return {Promise<TPlayerLeaderboard[]>} A promise with the players including their regional rank.
 */
export const fetchRegionRank = async (
  players: TPlayerLeaderboard[],
): Promise<TPlayerLeaderboard[]> =>
  Promise.all(
    players.map(async (player) => {
      try {
        const url = `https://op.gg/lol/summoners/euw/${encodeURIComponent(
          player.inGameName,
        )}-${encodeURIComponent(player.tagLine)}`;

        const response = await fetch(url, {
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OverLoL/1.0)' },
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        const sel2 =
          '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(2) > a > span > span';
        const sel3 =
          '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(3) > a > span > span';
        const regionRank = $(sel2).text().trim() || $(sel3).text().trim() || '';
        return { ...player, regionRank };
      } catch {
        return { ...player, regionRank: '' };
      }
    }),
  );
