import type { TChampion } from '@/types/ChampionType';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import * as cheerio from 'cheerio';

/**
 * docs: https://developer.riotgames.com/docs/lol#data-dragon_champions
 */

/**
 * Fetch the latest LoL version.
 * @returns {Promise<string>} A promise of the latest LoL version.
 */
export const fetchLatestLolVersion = (): Promise<string> =>
  fetch('/api/lol/versions/latest').then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });

/**
 * Fetch the list of champions from a specific LoL version.
 * @param lolVersion The LoL version to fetch champions from.
 * @returns {Promise<TChampion[]>} A promise with the list of champions.
 */
export const fetchChampionsByVersion = (lolVersion: string): Promise<TChampion[]> =>
  fetch(`/api/lol/${lolVersion}/champions`).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });

/**
 * Fetch KC leaderboard data.
 * @returns {Promise<TPlayerLeaderboard[]>} A promise with the leaderboard data.
 */
export const fetchKcLeaderboard = (): Promise<TPlayerLeaderboard[]> =>
  fetch('/api/lol/leaderboard').then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });

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
