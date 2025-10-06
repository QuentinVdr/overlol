import { TChampion } from '@/types/ChampionType';
import { logger } from '@/utils/logger';
import { NextResponse } from 'next/server';

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

  return fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
    // Next.js Data Cache
    next: {
      revalidate: 604800, // 7 days
      tags: ['lol-champions', `champions-${version}`],
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<ChampionsApiResponse>;
    })
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

      return NextResponse.json(champions, {
        headers: {
          // Browser cache: 1 day (stable data)
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        },
      });
    })
    .catch((error) => {
      log.error('Failed to fetch champions', error);
      return NextResponse.json(
        { error: 'Failed to fetch champions' },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    });
}
