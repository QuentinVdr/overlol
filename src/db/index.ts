import { TOverlay } from '@/types/OverlayType';
import { logger } from '@/utils/logger';
import Database from 'better-sqlite3';
import { and, eq, gt, lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';
import { overlays, type NewOverlayEntity, type OverlayEntity } from './schema';

const dbPath = path.join(process.cwd(), '.overlay-storage', 'overlays.db');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Create database connection
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('wal_autocheckpoint = 1000');
sqlite.pragma('cache_size = -2000');

export const db = drizzle(sqlite);

const log = logger.child('db:overlay');

export class OverlayService {
  static #instance: OverlayService;
  private readonly cleanUpInterval: NodeJS.Timeout;

  constructor() {
    log.info(`Set up clean up interval for expired overlays every hour`);
    this.cleanUpInterval = setInterval(
      async () => {
        try {
          await this.cleanupExpired();
        } catch (error) {
          log.error('Error during scheduled cleanup:', error);
        }
      },
      6 * 60 * 60 * 1000, // 6 hours = 6 * 60 minutes * 60 seconds * 1000 milliseconds
    );

    // Clean up interval on process termination
    const cleanup = () => {
      this.destroy();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }

  public static get instance(): OverlayService {
    if (!OverlayService.#instance) {
      OverlayService.#instance = new OverlayService();
    }

    return OverlayService.#instance;
  }

  // Method to properly clean up the interval
  destroy(): void {
    if (this.cleanUpInterval) {
      clearInterval(this.cleanUpInterval);
      log.info('Cleanup interval cleared');
    }
  }

  // Get overlay by ID (only if not expired)
  async getOverlay(id: string): Promise<OverlayEntity | null> {
    this.cleanupExpired();
    const now = new Date();
    const row =
      db
        .select()
        .from(overlays)
        .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)))
        .limit(1)
        .get() ?? null;
    return row;
  }

  // Create a new overlay
  async createOverlay(data: TOverlay, expirationHours: number = 2): Promise<string> {
    this.cleanupExpired();
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

    const newOverlay: NewOverlayEntity = {
      id,
      data,
      createdAt: now,
      expiresAt,
      updatedAt: now,
    };

    await db.insert(overlays).values(newOverlay);
    return id;
  }

  // Update existing overlay
  async updateOverlay(id: string, data: TOverlay): Promise<boolean> {
    this.cleanupExpired();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const res = db
      .update(overlays)
      .set({ data, updatedAt: now, expiresAt })
      .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)))
      .run();
    return res.changes > 0;
  }

  // Delete overlay
  async deleteOverlay(id: string): Promise<boolean> {
    this.cleanupExpired();
    const res = db.delete(overlays).where(eq(overlays.id, id)).run();
    return res.changes > 0;
  }

  // Clean up expired overlays
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    const res = db.delete(overlays).where(lt(overlays.expiresAt, now)).run();
    log.info(`Cleaned up ${res.changes} expired overlays`);
    return res.changes;
  }

  // Get overlay count and stats
  async getStats(): Promise<{
    active: number;
  }> {
    const now = new Date();
    const active = db
      .select({ id: overlays.id })
      .from(overlays)
      .where(gt(overlays.expiresAt, now))
      .all().length;
    return { active };
  }
}

export const overlayService = OverlayService.instance;
