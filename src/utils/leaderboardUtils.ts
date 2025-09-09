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
      const response = await fetch(
        `https://op.gg/lol/summoners/euw/${player.inGameName}-${player.tagLine}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)',
          },
        },
      );
      const html = await response.text();
      const $ = cheerio.load(html);

      let regionRank = '';
      regionRank = $(
        '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(2) > a > span > span',
      ).text();
      if (!regionRank) {
        regionRank = $(
          '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(3) > a > span > span',
        ).text();
      }
      console.log('🚀 ~ GET ~ regionRank:', regionRank);

      return {
        ...player,
        regionRank,
      };
    }),
  );
