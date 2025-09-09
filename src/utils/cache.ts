interface CacheEntry<T> {
  data: T;
  expiresAt: number; // Timestamp when the entry expires
}

class SimpleCache {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(autoCleanupIntervalMinutes: number = 30) {
    // Auto-start cleanup in constructor only on server-side
    if (typeof window === 'undefined' && autoCleanupIntervalMinutes > 0) {
      this.cleanupInterval = setInterval(
        () => {
          const cleaned = this.cleanup();
          if (cleaned > 0) {
            console.log(`Cleaned ${cleaned} expired cache entries`);
          }
        },
        autoCleanupIntervalMinutes * 60 * 1000,
      );
    }
  }

  set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

    this.cache.set(key, {
      data,
      expiresAt,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  // Destroy the cache and stop cleanup interval
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

export const lolCache = new SimpleCache(30); // Auto-cleanup every 30 minutes

// Clean up on process exit (Node.js only)
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    lolCache.destroy();
  });

  process.on('SIGINT', () => {
    lolCache.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    lolCache.destroy();
    process.exit(0);
  });
}
