import { CACHE_DURATIONS, CACHE_TAGS, cachedFetch } from '@/utils/cacheUtils';
import { logger } from '@/utils/logger';

const log = logger.child('api:version');

export async function GET() {
  return cachedFetch<string[]>('https://ddragon.leagueoflegends.com/api/versions.json', {
    headers: { accept: 'application/json' },
    revalidate: CACHE_DURATIONS.VERSION,
    tags: [CACHE_TAGS.VERSION],
    logPrefix: 'version',
  })
    .then((versions) => {
      if (!Array.isArray(versions) || typeof versions[0] !== 'string') {
        throw new Error('Unexpected Data Dragon response shape');
      }
      return Response.json(versions[0]);
    })
    .catch((error) => {
      log.error('Failed to fetch latest version', error);
      return Response.json({ error: 'Failed to fetch latest version' }, { status: 500 });
    });
}
