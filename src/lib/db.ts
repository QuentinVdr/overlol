import { logger } from '@/utils/logger';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), '.overlay-storage', 'overlays.db');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('wal_autocheckpoint = 1000');
sqlite.pragma('cache_size = -2000');

export const db = drizzle(sqlite);

const log = logger.child('db');

/**
 * Close the database connection gracefully
 * Should be called when the application is shutting down
 */
export function closeDatabase(): void {
  try {
    sqlite.close();
    log.info('Database connection closed');
  } catch (error) {
    log.error('Error closing database:', error);
  }
}

// Setup cleanup handlers for graceful shutdown
const cleanup = () => {
  log.info('Cleaning up database connection...');
  closeDatabase();
};

// Handle different shutdown signals with deduplication to prevent memory leaks
// Only add listeners if they haven't been added yet (prevents accumulation in HMR)
if (!process.listenerCount('SIGINT')) {
  process.on('SIGINT', cleanup);
}

if (!process.listenerCount('SIGTERM')) {
  process.on('SIGTERM', cleanup);
}

if (!process.listenerCount('beforeExit')) {
  process.on('beforeExit', cleanup);
}

// Handle uncaught errors with deduplication
const uncaughtExceptionHandler = (error: Error) => {
  log.error('Uncaught exception:', error);
  closeDatabase();
  process.exit(1);
};

if (!process.listenerCount('uncaughtException')) {
  process.on('uncaughtException', uncaughtExceptionHandler);
}

const unhandledRejectionHandler = (reason: unknown, promise: Promise<unknown>) => {
  log.error('Unhandled rejection at:', promise, 'reason:', reason);
  closeDatabase();
  process.exit(1);
};

if (!process.listenerCount('unhandledRejection')) {
  process.on('unhandledRejection', unhandledRejectionHandler);
}
