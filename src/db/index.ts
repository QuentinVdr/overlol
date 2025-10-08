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

const log = logger.child('db:overlay');

// Helper function to create a database connection
function connectDB() {
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('wal_autocheckpoint = 1000');
  sqlite.pragma('cache_size = -2000');

  const db = drizzle(sqlite);

  return { sqlite, db };
}

// Helper function to close database connection
function closeDB(sqlite: Database.Database) {
  try {
    sqlite.pragma('wal_checkpoint(PASSIVE)');
    sqlite.close();
  } catch (error) {
    log.warn('Error closing SQLite connection:', error);
  }
}

export class OverlayService {
  // Get overlay by ID (only if not expired)
  async getOverlay(id: string): Promise<OverlayEntity | null> {
    const { sqlite, db } = connectDB();
    try {
      const now = new Date();
      const row =
        db
          .select()
          .from(overlays)
          .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)))
          .limit(1)
          .get() ?? null;
      return row;
    } catch (error) {
      log.error('Error getting overlay:', error);
      return null;
    } finally {
      closeDB(sqlite);
    }
  }

  // Create a new overlay
  async createOverlay(data: TOverlay, expirationHours: number = 2): Promise<string> {
    const { sqlite, db } = connectDB();
    try {
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
      log.debug(`Created overlay with ID: ${id}`);
      return id;
    } catch (error) {
      log.error('Error creating overlay:', error);
      throw error;
    } finally {
      closeDB(sqlite);
    }
  }

  // Update existing overlay
  async updateOverlay(id: string, data: TOverlay): Promise<boolean> {
    const { sqlite, db } = connectDB();
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      const res = db
        .update(overlays)
        .set({ data, updatedAt: now, expiresAt })
        .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)))
        .run();

      if (res.changes > 0) {
        log.debug(`Updated overlay with ID: ${id}`);
      }
      return res.changes > 0;
    } catch (error) {
      log.error('Error updating overlay:', error);
      return false;
    } finally {
      closeDB(sqlite);
    }
  }

  // Delete overlay
  async deleteOverlay(id: string): Promise<boolean> {
    const { sqlite, db } = connectDB();
    try {
      const res = db.delete(overlays).where(eq(overlays.id, id)).run();
      if (res.changes > 0) {
        log.debug(`Deleted overlay with ID: ${id}`);
      }
      return res.changes > 0;
    } catch (error) {
      log.error('Error deleting overlay:', error);
      return false;
    } finally {
      closeDB(sqlite);
    }
  }

  // Clean up expired overlays
  async cleanupExpired(): Promise<number> {
    const { sqlite, db } = connectDB();
    try {
      const now = new Date();
      const res = db.delete(overlays).where(lt(overlays.expiresAt, now)).run();
      if (res.changes > 0) {
        log.info(`Cleaned up ${res.changes} expired overlays`);
        // Run WAL checkpoint after cleanup to free memory
        sqlite.pragma('wal_checkpoint(TRUNCATE)');
      }
      return res.changes;
    } catch (error) {
      log.error('Error during cleanup:', error);
      return 0;
    } finally {
      closeDB(sqlite);
    }
  }

  // Get overlay count and stats
  async getStats(): Promise<{ active: number }> {
    const { sqlite, db } = connectDB();
    try {
      const now = new Date();
      const active = db
        .select({ id: overlays.id })
        .from(overlays)
        .where(gt(overlays.expiresAt, now))
        .all().length;
      return { active };
    } catch (error) {
      log.error('Error getting stats:', error);
      return { active: 0 };
    } finally {
      closeDB(sqlite);
    }
  }
}

export const overlayService = new OverlayService();
