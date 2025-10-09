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

// Track if handlers are already registered (prevents HMR duplicates)
let handlersRegistered = false;
// Track if database is closed to prevent double-close
let isDatabaseClosed = false;

/**
 * Close the database connection gracefully
 * Should be called when the application is shutting down
 */
export function closeDatabase(): void {
  // Prevent closing an already-closed database
  if (!sqlite || isDatabaseClosed) {
    log.debug('Database already closed, skipping');
    return;
  }

  try {
    sqlite.close();
    isDatabaseClosed = true;
    log.info('Database connection closed');
  } catch (error) {
    log.error('Error closing database:', error);
  }
}

// Named handler functions for proper deduplication

const handleSigint = () => {
  log.info('Received SIGINT, cleaning up...');
  closeDatabase();
  process.exit(0);
};

const handleSigterm = () => {
  log.info('Received SIGTERM, cleaning up...');
  closeDatabase();
  process.exit(0);
};

const handleBeforeExit = () => {
  log.info('Process beforeExit, cleaning up...');
  closeDatabase();
};

const handleUncaughtException = (error: Error) => {
  log.error('Uncaught exception:', error);
  closeDatabase();
  process.exit(1);
};

const handleUnhandledRejection = (reason: unknown, promise: Promise<unknown>) => {
  log.error('Unhandled rejection at:', promise, 'reason:', reason);
  closeDatabase();
  process.exit(1);
};

// Register handlers only once (prevents accumulation in HMR)
if (!handlersRegistered) {
  // Check if specific handlers are already registered
  const sigintListeners = process.listeners('SIGINT');
  const sigtermListeners = process.listeners('SIGTERM');
  const beforeExitListeners = process.listeners('beforeExit');
  const uncaughtExceptionListeners = process.listeners('uncaughtException');
  const unhandledRejectionListeners = process.listeners('unhandledRejection');

  if (!sigintListeners.includes(handleSigint)) {
    process.on('SIGINT', handleSigint);
  }

  if (!sigtermListeners.includes(handleSigterm)) {
    process.on('SIGTERM', handleSigterm);
  }

  if (!beforeExitListeners.includes(handleBeforeExit)) {
    process.on('beforeExit', handleBeforeExit);
  }

  if (!uncaughtExceptionListeners.includes(handleUncaughtException)) {
    process.on('uncaughtException', handleUncaughtException);
  }

  if (!unhandledRejectionListeners.includes(handleUnhandledRejection)) {
    process.on('unhandledRejection', handleUnhandledRejection);
  }

  handlersRegistered = true;
  log.debug('Database cleanup handlers registered');
}
