import { unstable_cache } from 'next/cache';
import { logger } from './logger';

// Cache durations in seconds
export const CACHE_DURATIONS = {
  CHAMPIONS: 24 * 60 * 60, // 1 day
  VERSION: 30 * 60, // 30 minutes
  LEADERBOARD: 30 * 60, // 30 minutes
  DEFAULT: 30 * 60, // 30 minutes
} as const;

// Cache tags for grouped invalidation
export const CACHE_TAGS = {
  CHAMPIONS: 'champions',
  VERSION: 'version',
  LEADERBOARD: 'leaderboard',
  LOL_DATA: 'lol-data',
} as const;

/**
 * Create a cached function with logging
 * @param fn - The async function to cache
 * @param keyParts - Array of strings to create cache key
 * @param options - Cache options
 */
export function createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyParts: string[],
  options?: {
    revalidate?: number;
    tags?: string[];
    logPrefix?: string;
  },
): T {
  const log = options?.logPrefix ? logger.child(options.logPrefix) : logger;

  const cachedFn = unstable_cache(
    (...args: Parameters<T>) => {
      log.debug(`Cache miss, fetching data...`);

      return fn(...args);
    },
    keyParts,
    {
      revalidate: options?.revalidate ?? CACHE_DURATIONS.DEFAULT,
      tags: options?.tags ?? [CACHE_TAGS.LOL_DATA],
    },
  );

  return cachedFn as T;
}

/**
 * Wrapper for fetch with caching and logging
 * @param url - The URL to fetch
 * @param options - Fetch options including cache config
 */
export function cachedFetch<T = unknown>(
  url: string,
  options?: RequestInit & {
    revalidate?: number;
    tags?: string[];
    logPrefix?: string;
  },
): Promise<T> {
  const log = options?.logPrefix ? logger.child(options.logPrefix) : logger;

  log.debug(`Fetching: ${url}`);

  return fetch(url, {
    ...options,
    next: {
      revalidate: options?.revalidate ?? CACHE_DURATIONS.DEFAULT,
      tags: options?.tags ?? [CACHE_TAGS.LOL_DATA],
    },
    signal: options?.signal ?? AbortSignal.timeout(5000),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      log.debug(`Fetch successful: ${url}`);
      return data as T;
    })
    .catch((error) => {
      log.error(`Fetch failed: ${url}`, error);
      throw error;
    });
}
