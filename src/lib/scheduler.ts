import { overlayService } from '@/db';
import { logger } from '@/utils/logger';
import * as cron from 'node-cron';

const log = logger.child('scheduler');

/**
 * Cleanup scheduler configuration
 */
const CLEANUP_SCHEDULE = process.env.CLEANUP_CRON_SCHEDULE || '0 */6 * * *'; // Every 6 hours by default
const SCHEDULER_ENABLED = process.env.ENABLE_SCHEDULER !== 'false'; // Enabled by default

let cleanupTask: ReturnType<typeof cron.schedule> | null = null;

/**
 * Start the cleanup scheduler
 * Runs the cleanup task on a cron schedule
 */
export function startScheduler() {
  if (!SCHEDULER_ENABLED) {
    log.info('Scheduler is disabled via ENABLE_SCHEDULER env variable');
    return;
  }

  if (cleanupTask) {
    log.warn('Scheduler already running');
    return;
  }

  log.info(`Starting cleanup scheduler with schedule: ${CLEANUP_SCHEDULE}`);

  cleanupTask = cron.schedule(CLEANUP_SCHEDULE, async () => {
    try {
      log.info('Running scheduled cleanup...');

      await overlayService.cleanupExpired();
    } catch (error) {
      log.error('Error during scheduled cleanup:', error);
    }
  });

  log.info('Cleanup scheduler started successfully');

  // Run initial cleanup on startup
  (async () => {
    try {
      log.info('Running initial cleanup on startup...');
      await overlayService.cleanupExpired();
    } catch (error) {
      log.error('Error during initial cleanup:', error);
    }
  })();
}

/**
 * Stop the cleanup scheduler
 */
export function stopScheduler() {
  if (cleanupTask) {
    log.info('Stopping cleanup scheduler...');
    cleanupTask.stop();
    cleanupTask = null;
    log.info('Cleanup scheduler stopped');
  }
}
