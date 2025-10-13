import { TChampion } from '@/types/ChampionType';

/**
 * Server-side function to fetch the latest LoL version directly from Data Dragon.
 * @returns {Promise<string>} A promise of the latest LoL version.
 */
export async function getLatestLolVersion(): Promise<string> {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
    next: {
      revalidate: 1800, // 30 minutes cache
      tags: ['lol-version'],
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch latest LoL version: ${response.status}`);
  }

  const versions = await response.json();

  if (!Array.isArray(versions) || typeof versions[0] !== 'string') {
    throw new Error('Unexpected Data Dragon response shape');
  }

  return versions[0];
}

// Types from the API route
interface ChampionImageData {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ChampionApiData {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  image: ChampionImageData;
  tags: string[];
  partype: string;
  stats: Record<string, number>;
}

interface ChampionsApiResponse {
  type: string;
  format: string;
  version: string;
  data: Record<string, ChampionApiData>;
}

/**
 * Server-side function to fetch the list of champions from a specific LoL version.
 * @param lolVersion The LoL version to fetch champions from.
 * @returns {Promise<TChampion[]>} A promise with the list of champions.
 */
export async function getChampionsByVersion(lolVersion: string): Promise<TChampion[]> {
  const response = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${lolVersion}/data/fr_FR/champion.json`,
    {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      next: {
        revalidate: 604800, // 7 days
        tags: ['lol-champions', `champions-${lolVersion}`],
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch champions for version ${lolVersion}: ${response.status}`);
  }

  const championsData = (await response.json()) as ChampionsApiResponse;

  const champions: TChampion[] = Object.keys(championsData.data).map((key) => {
    const champion = championsData.data[key];
    return {
      name: champion.name,
      id: champion.id,
      image: `https://ddragon.leagueoflegends.com/cdn/${lolVersion}/img/champion/${champion.image.full}`,
    };
  });

  return champions;
}

/**
 * Server-side function to fetch the latest champions.
 * @returns {Promise<TChampion[]>} A promise with the list of latest champions.
 */
export async function getLatestChampions(): Promise<TChampion[]> {
  const latestVersion = await getLatestLolVersion();
  return getChampionsByVersion(latestVersion);
}
