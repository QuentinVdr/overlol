import { TChampion } from '@/types/ChampionType';

/**
 * docs: https://developer.riotgames.com/docs/lol#data-dragon_champions
 */

/**
 * Fetch the latest version of the Riot API.
 * @returns {Promise<string>} A promise of the latest API version.
 */
export const fetchLatestRiotApiVersion = (): Promise<string> =>
  fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then((versions) => versions[0]);

/**
 * Fetch the list of champions from a specific API version.
 * @param apiVersion The API version to fetch champions from.
 * @returns {Promise<TChampion[]>} A promise with list of champions objects.
 */
export const fetchChampionsByVersion = (apiVersion: string): Promise<TChampion[]> =>
  fetch(`https://ddragon.leagueoflegends.com/cdn/${apiVersion}/data/fr_FR/champion.json`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then((championsList) =>
      Object.keys(championsList.data).map((key) => ({
        name: championsList.data[key].name,
        id: championsList.data[key].id,
        image: `https://ddragon.leagueoflegends.com/cdn/${apiVersion}/img/champion/${championsList.data[key].image.full}`,
      })),
    );
