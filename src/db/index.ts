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

export const db = drizzle(sqlite);

const log = logger.child('db:overlay');

export class OverlayService {
  // Get overlay by ID (only if not expired)
  async getOverlay(id: string): Promise<OverlayEntity | null> {
    this.cleanupExpired();
    const now = new Date();
    return db
      .select()
      .from(overlays)
      .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)))
      .limit(1)
      .then((result) => result[0] || null);
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

    return db
      .update(overlays)
      .set({
        data,
        updatedAt: now,
        expiresAt,
      })
      .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)))
      .then((res) => res.changes > 0);
  }

  // Delete overlay
  async deleteOverlay(id: string): Promise<boolean> {
    this.cleanupExpired();
    return db
      .delete(overlays)
      .where(eq(overlays.id, id))
      .then((res) => res.changes > 0);
  }

  // Clean up expired overlays
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    return db
      .delete(overlays)
      .where(lt(overlays.expiresAt, now))
      .then((res) => {
        log.info(`Cleaned up ${res.changes} expired overlays`);
        return res.changes;
      });
  }

  // Get overlay count and stats
  async getStats(): Promise<{
    active: number;
  }> {
    this.cleanupExpired();
    const now = new Date();
    return db
      .select({ count: overlays.id })
      .from(overlays)
      .where(gt(overlays.expiresAt, now))
      .then((res) => ({
        active: res.length,
      }));
  }
}

export const overlayService = new OverlayService();
