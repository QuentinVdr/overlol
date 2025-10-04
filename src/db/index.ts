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

// Global singleton storage to survive hot reloads
declare global {
  var __overlayService: OverlayService | undefined;
  var __sqliteConnection: Database.Database | undefined;
  var __overlayServiceInterval: NodeJS.Timeout | undefined;
}

const log = logger.child('db:overlay');

export class OverlayService {
  private readonly cleanUpInterval: NodeJS.Timeout;
  private readonly sqlite: Database.Database;
  private readonly db: ReturnType<typeof drizzle>;

  private constructor() {
    log.info('Creating new OverlayService instance');

    // Clean up any existing resources from hot reload
    if (global.__overlayServiceInterval) {
      clearInterval(global.__overlayServiceInterval);
      log.info('Cleared existing cleanup interval from hot reload');
    }

    if (global.__sqliteConnection) {
      try {
        global.__sqliteConnection.close();
        log.info('Closed existing SQLite connection from hot reload');
      } catch (error) {
        log.warn('Error closing existing SQLite connection:', error);
      }
    }

    // Create new database connection
    this.sqlite = new Database(dbPath);
    this.sqlite.pragma('journal_mode = WAL');
    this.sqlite.pragma('wal_autocheckpoint = 1000');
    this.sqlite.pragma('cache_size = -2000');

    // Store globally for cleanup on hot reload
    global.__sqliteConnection = this.sqlite;

    // Create drizzle instance
    this.db = drizzle(this.sqlite);

    // Set up cleanup interval with immediate first run
    this.cleanupExpired().catch((error) => {
      log.error('Error during initial cleanup:', error);
    });

    this.cleanUpInterval = setInterval(
      async () => {
        try {
          await this.cleanupExpired();
        } catch (error) {
          log.error('Error during scheduled cleanup:', error);
        }
      },
      6 * 60 * 60 * 1000, // 6 hours
    );

    // Store interval globally
    global.__overlayServiceInterval = this.cleanUpInterval;

    // Set up process cleanup handlers
    const cleanup = () => {
      this.destroy();
    };

    // Remove any existing listeners first
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('exit');

    // Add new listeners
    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);
    process.once('exit', cleanup);

    log.info('OverlayService initialized successfully');
  }

  public static get instance(): OverlayService {
    // Use global storage to survive hot reloads
    if (!global.__overlayService) {
      global.__overlayService = new OverlayService();
    }
    return global.__overlayService;
  }

  // Method to properly clean up resources
  destroy(): void {
    log.info('Destroying OverlayService instance');

    if (this.cleanUpInterval) {
      clearInterval(this.cleanUpInterval);
      log.info('Cleanup interval cleared');
    }

    if (this.sqlite) {
      try {
        // Run final WAL checkpoint before closing
        this.sqlite.pragma('wal_checkpoint(TRUNCATE)');
        this.sqlite.close();
        log.info('SQLite connection closed');
      } catch (error) {
        log.error('Error closing SQLite connection:', error);
      }
    }

    // Clear global references
    global.__overlayService = undefined;
    global.__sqliteConnection = undefined;
    global.__overlayServiceInterval = undefined;
  }

  // Get overlay by ID (only if not expired)
  async getOverlay(id: string): Promise<OverlayEntity | null> {
    try {
      const now = new Date();
      const row =
        this.db
          .select()
          .from(overlays)
          .where(and(eq(overlays.id, id), gt(overlays.expiresAt, now)))
          .limit(1)
          .get() ?? null;
      return row;
    } catch (error) {
      log.error('Error getting overlay:', error);
      return null;
    }
  }

  // Create a new overlay
  async createOverlay(data: TOverlay, expirationHours: number = 2): Promise<string> {
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

    try {
      await this.db.insert(overlays).values(newOverlay);
      log.debug(`Created overlay with ID: ${id}`);
      return id;
    } catch (error) {
      log.error('Error creating overlay:', error);
      throw error;
    }
  }

  // Update existing overlay
  async updateOverlay(id: string, data: TOverlay): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    try {
      const res = this.db
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
    }
  }

  // Delete overlay
  async deleteOverlay(id: string): Promise<boolean> {
    try {
      const res = this.db.delete(overlays).where(eq(overlays.id, id)).run();
      if (res.changes > 0) {
        log.debug(`Deleted overlay with ID: ${id}`);
      }
      return res.changes > 0;
    } catch (error) {
      log.error('Error deleting overlay:', error);
      return false;
    }
  }

  // Clean up expired overlays
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    try {
      const res = this.db.delete(overlays).where(lt(overlays.expiresAt, now)).run();
      if (res.changes > 0) {
        log.info(`Cleaned up ${res.changes} expired overlays`);

        // Run WAL checkpoint after cleanup to free memory
        this.sqlite.pragma('wal_checkpoint(PASSIVE)');
      }
      return res.changes;
    } catch (error) {
      log.error('Error during cleanup:', error);
      return 0;
    }
  }

  // Get overlay count and stats
  async getStats(): Promise<{ active: number }> {
    const now = new Date();
    try {
      const active = this.db
        .select({ id: overlays.id })
        .from(overlays)
        .where(gt(overlays.expiresAt, now))
        .all().length;
      return { active };
    } catch (error) {
      log.error('Error getting stats:', error);
      return { active: 0 };
    }
  }
}

export const overlayService = OverlayService.instance;
