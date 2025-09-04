import { TChampion } from '@/types/ChampionType';
import { lolCache } from '@/utils/cache';

export async function GET(_: Request, context: { params: Promise<{ version: string }> }) {
  try {
    const { version } = await context.params;
    const cacheKey = `champions-${version}`;

    let champions = lolCache.get<TChampion[]>(cacheKey);

    if (!champions) {
      const response = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`,
        {
          signal: AbortSignal.timeout(5000), // 5 second timeout
          headers: { Accept: 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const championsList = await response.json();

      if (!championsList.data || typeof championsList.data !== 'object') {
        throw new Error('Invalid API response: missing or invalid data field');
      }

      champions = Object.keys(championsList.data).map((key) => {
        const champion = championsList.data[key];
        if (!champion.name || !champion.id || !champion.image?.full) {
          throw new Error(`Invalid champion data for ${key}: missing required fields`);
        }
        return {
          name: champion.name,
          id: champion.id,
          image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
        };
      });

      lolCache.set(cacheKey, champions, 7 * 24 * 60);
    }

    return Response.json(champions);
  } catch (error) {
    console.error('Error fetching champions:', error);
    return Response.json({ error: 'Failed to fetch champions' }, { status: 500 });
  }
}
