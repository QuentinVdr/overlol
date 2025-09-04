import { lolCache } from '@/utils/cache';

export async function GET() {
  try {
    const cacheKey = 'lol-latest-version';

    let version = lolCache.get<string>(cacheKey);

    if (!version) {
      const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = (await response.json()) as unknown;

      if (!Array.isArray(payload) || typeof payload[0] !== 'string') {
        throw new Error('Unexpected Data Dragon response shape');
      }

      version = payload[0];

      lolCache.set(cacheKey, version, 30);
    }

    return Response.json(version);
  } catch (error) {
    console.error('Error fetching LoL latest version:', error);
    return Response.json({ error: 'Failed to fetch latest version' }, { status: 500 });
  }
}
