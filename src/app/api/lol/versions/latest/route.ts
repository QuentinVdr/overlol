import { logger } from '@/utils/logger';
import { NextResponse } from 'next/server';

const log = logger.child('api:version');

export const revalidate = 1800; // 30 minutes

export async function GET() {
  return fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
    // Next.js Data Cache
    next: {
      revalidate,
      tags: ['lol-version'],
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((versions) => {
      if (!Array.isArray(versions) || typeof versions[0] !== 'string') {
        throw new Error('Unexpected Data Dragon response shape');
      }

      log.info('Returning latest version');

      return NextResponse.json(versions[0], {
        headers: {
          // Browser cache: 5 minutes (shorter than server cache)
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=59',
        },
      });
    })
    .catch((error) => {
      log.error('Failed to fetch latest version', error);
      return NextResponse.json(
        { error: 'Failed to fetch latest version' },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store', // Never cache errors
          },
        },
      );
    });
}
