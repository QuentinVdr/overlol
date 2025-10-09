import { type NewOverlayEntity, type OverlayEntity, overlays } from '@/db/schema';
import { db } from '@/lib/db';
import { TOverlay } from '@/types/OverlayType';
import { logger } from '@/utils/logger';
import { and, eq, gt, lt } from 'drizzle-orm';

const log = logger.child('db:overlay');

export const OverlayService = {
  // Get overlay by ID (only if not expired)
  getOverlay(id: string): OverlayEntity | null {
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
    }
  },

  // Create a new overlay
  createOverlay(data: TOverlay, expirationHours: number = 2): string {
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

      db.insert(overlays).values(newOverlay).run();
      log.debug(`Created overlay with ID: ${id}`);
      return id;
    } catch (error) {
      log.error('Error creating overlay:', error);
      throw error;
    }
  },

  // Update existing overlay
  updateOverlay(id: string, data: TOverlay, expirationHours: number = 2): boolean {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

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
    }
  },

  // Delete overlay
  deleteOverlay(id: string): boolean {
    try {
      const res = db.delete(overlays).where(eq(overlays.id, id)).run();
      if (res.changes > 0) {
        log.debug(`Deleted overlay with ID: ${id}`);
      }
      return res.changes > 0;
    } catch (error) {
      log.error('Error deleting overlay:', error);
      return false;
    }
  },

  // Clean up expired overlays
  cleanupExpired(): number {
    try {
      const now = new Date();
      const res = db.delete(overlays).where(lt(overlays.expiresAt, now)).run();
      if (res.changes > 0) {
        log.info(`Cleaned up ${res.changes} expired overlays`);
      }
      return res.changes;
    } catch (error) {
      log.error('Error during cleanup:', error);
      return 0;
    }
  },

  // Get overlay count and stats
  getStats(): { active: number } {
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
    }
  },
};
