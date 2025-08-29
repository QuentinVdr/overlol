import Database from 'better-sqlite3';
import { and, eq, gt, lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import { overlays, type NewOverlay, type Overlay } from './schema';

const dbPath = path.join(process.cwd(), '.overlay-storage', 'overlays.db');

// Ensure directory exists
const fs = require('fs');
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Create database connection
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite);

export class OverlayService {
  // Get overlay by ID (only if not expired)
  async getOverlay(id: string): Promise<Overlay | null> {
    const now = new Date();
    const result = await db
      .select()
      .from(overlays)
      .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)))
      .limit(1);

    return result[0] || null;
  }

  // Create a new overlay
  async createOverlay(data: any, expirationHours: number = 2): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

    const newOverlay: NewOverlay = {
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
  async updateOverlay(id: string, data: any): Promise<boolean> {
    const now = new Date();
    const result = await db
      .update(overlays)
      .set({
        data,
        updatedAt: now,
      })
      .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)));

    return result.changes > 0;
  }

  // Delete overlay
  async deleteOverlay(id: string): Promise<boolean> {
    const result = await db.delete(overlays).where(eq(overlays.id, id));
    return result.changes > 0;
  }

  // Clean up expired overlays
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    const result = await db.delete(overlays).where(lt(overlays.expiresAt, now));
    return result.changes;
  }

  // Get overlay count and stats
  async getStats(): Promise<{
    active: number;
  }> {
    const now = new Date();
    const activeResult = await db
      .select({ count: overlays.id })
      .from(overlays)
      .where(gt(overlays.expiresAt, now));

    return {
      active: activeResult.length,
    };
  }
}

// Export singleton instance
export const overlayService = new OverlayService();

// Cleanup scheduler class
class CleanupScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

  start() {
    if (this.intervalId) {
      return; // Already running
    }

    console.log(`Starting cleanup scheduler (every ${this.CLEANUP_INTERVAL / 60000} minutes)`);

    // Run cleanup immediately
    this.runCleanup();

    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Cleanup scheduler stopped');
    }
  }

  private async runCleanup() {
    try {
      const cleanedCount = await overlayService.cleanupExpired();
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Auto-cleanup: Removed ${cleanedCount} expired overlays`);
    } catch (error) {
      console.error('Error during auto-cleanup:', error);
    }
  }
}

// Export cleanup scheduler instance
export const cleanupScheduler = new CleanupScheduler();

// Auto-start cleanup scheduler in development and production
if (typeof window === 'undefined') {
  // Only run on server side
  cleanupScheduler.start();
}
