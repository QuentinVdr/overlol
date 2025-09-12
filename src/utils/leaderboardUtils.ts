import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import * as cheerio from 'cheerio';

/**
 * Fetch regional rank for a players.
 * @param players The players to fetch regional rank for.
 * @return {Promise<TPlayerLeaderboard[]>} A promise with the players including their regional rank.
 */
export const fetchRegionRank = async (
  players: TPlayerLeaderboard[],
): Promise<TPlayerLeaderboard[]> => {
  console.log(`Starting fetchRegionRank for ${players.length} players`);

  try {
    const results = await Promise.all(
      players.map(async (player, index) => {
        console.log(`Processing player ${index + 1}/${players.length}: ${player.inGameName}`);
        try {
          const url = `https://op.gg/lol/summoners/euw/${encodeURIComponent(
            player.inGameName,
          )}-${encodeURIComponent(player.tagLine)}`;

          console.log(`Fetching: ${url}`);
          const response = await fetch(url, {
            signal: AbortSignal.timeout(30000),
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OverLoL/1.0)' },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          console.log(`Response for ${player.inGameName}: ${response.status}`);
          const html = await response.text();
          const $ = cheerio.load(html);
          const sel2 =
            '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(2) > a > span > span';
          const sel3 =
            '#content-header > div:nth-child(1) > div > div > div > div > div > div > div.flex.flex-wrap.items-center.gap-2 > div > ul > li:nth-child(3) > a > span > span';
          const regionRank = $(sel2).text().trim() || $(sel3).text().trim() || '';
          console.log(`Found region rank for ${player.inGameName}: ${regionRank}`);
          return { ...player, regionRank };
        } catch (error) {
          console.error(`Error fetching rank for ${player.inGameName}:`, error);
          return { ...player, regionRank: '' };
        }
      }),
    );

    console.log(`Completed fetchRegionRank for all ${players.length} players`);
    return results;
  } catch (error) {
    console.error('fetchRegionRank Promise.all failed:', error);
    throw error;
  }
};
