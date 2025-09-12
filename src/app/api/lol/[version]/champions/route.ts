import { TChampion } from '@/types/ChampionType';
import { CACHE_DURATIONS, CACHE_TAGS, cachedFetch } from '@/utils/cacheUtils';
import { logger } from '@/utils/logger';

const log = logger.child('api:champions');

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

export async function GET(_: Request, context: { params: Promise<{ version: string }> }) {
  const { version } = await context.params;

  return cachedFetch<ChampionsApiResponse>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`,
    {
      headers: { Accept: 'application/json' },
      revalidate: CACHE_DURATIONS.CHAMPIONS,
      tags: [CACHE_TAGS.CHAMPIONS, `champions-${version}`],
      logPrefix: 'champions',
    },
  )
    .then(({ data }) => {
      const champions: TChampion[] = Object.keys(data).map((key) => {
        const champion = data[key];

        return {
          name: champion.name,
          id: champion.id,
          image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`,
        };
      });

      log.info(`Returning ${champions.length} champions for version ${version}`);
      return Response.json(champions);
    })
    .catch((error) => {
      log.error('Failed to fetch champions', error);
      return Response.json({ error: 'Failed to fetch champions' }, { status: 500 });
    });
}
