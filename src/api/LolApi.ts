import type { TChampion } from '@/types/ChampionType';

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
