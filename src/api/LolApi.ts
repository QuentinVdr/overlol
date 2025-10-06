import type { TChampion } from '@/types/ChampionType';
import { TPlayerLeaderboard } from '@/types/PlayerLeaderboard';
import { jsonRequest } from '@/utils/apiUtils';

/**
 * docs: https://developer.riotgames.com/docs/lol#data-dragon_champions
 */

/**
 * Fetch the latest LoL version.
 * @returns {Promise<string>} A promise of the latest LoL version.
 */
export const fetchLatestLolVersion = (): Promise<string> => jsonRequest('/api/lol/versions/latest');

/**
 * Fetch the list of champions from a specific LoL version.
 * @param lolVersion The LoL version to fetch champions from.
 * @returns {Promise<TChampion[]>} A promise with the list of champions.
 */
export const fetchChampionsByVersion = (lolVersion: string): Promise<TChampion[]> =>
  jsonRequest(`/api/lol/${lolVersion}/champions`);

/**
 * Fetch KC leaderboard data.
 * @returns {Promise<TPlayerLeaderboard[]>} A promise with the leaderboard data.
 */
export const fetchKcLeaderboard = (): Promise<TPlayerLeaderboard[]> =>
  jsonRequest('/api/lol/leaderboard', {}, 60000);
