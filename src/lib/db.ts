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

// Persist handlers and registration state on globalThis to survive HMR reloads
// This prevents duplicate process listeners across module reloads
declare global {
  // eslint-disable-next-line no-var
  var __overlol_dbHandlers:
    | {
        registered: boolean;
        handleSigint: () => void;
        handleSigterm: () => void;
        handleBeforeExit: () => void;
        handleUncaughtException: (error: Error) => void;
        handleUnhandledRejection: (reason: unknown, promise: Promise<unknown>) => void;
      }
    | undefined;
}

// Initialize or reuse handlers from globalThis (survives HMR reloads)
globalThis.__overlol_dbHandlers ??= {
  registered: false,

  handleSigint: () => {
    log.info('Received SIGINT, cleaning up...');
    closeDatabase();
    process.exit(0);
  },

  handleSigterm: () => {
    log.info('Received SIGTERM, cleaning up...');
    closeDatabase();
    process.exit(0);
  },

  handleBeforeExit: () => {
    log.info('Process beforeExit, cleaning up...');
    closeDatabase();
  },

  handleUncaughtException: (error: Error) => {
    log.error('Uncaught exception:', error);
    closeDatabase();
    process.exit(1);
  },

  handleUnhandledRejection: (reason: unknown, promise: Promise<unknown>) => {
    log.error('Unhandled rejection at:', promise, 'reason:', reason);
    closeDatabase();
    process.exit(1);
  },
};

// Get handlers from global storage
const handlers = globalThis.__overlol_dbHandlers;

// Register handlers only once using the persisted flag and function references
if (!handlers.registered) {
  // Check if specific handlers are already registered (extra safety)
  const sigintListeners = process.listeners('SIGINT');
  const sigtermListeners = process.listeners('SIGTERM');
  const beforeExitListeners = process.listeners('beforeExit');
  const uncaughtExceptionListeners = process.listeners('uncaughtException');
  const unhandledRejectionListeners = process.listeners('unhandledRejection');

  if (!sigintListeners.includes(handlers.handleSigint)) {
    process.on('SIGINT', handlers.handleSigint);
  }

  if (!sigtermListeners.includes(handlers.handleSigterm)) {
    process.on('SIGTERM', handlers.handleSigterm);
  }

  if (!beforeExitListeners.includes(handlers.handleBeforeExit)) {
    process.on('beforeExit', handlers.handleBeforeExit);
  }

  if (!uncaughtExceptionListeners.includes(handlers.handleUncaughtException)) {
    process.on('uncaughtException', handlers.handleUncaughtException);
  }

  if (!unhandledRejectionListeners.includes(handlers.handleUnhandledRejection)) {
    process.on('unhandledRejection', handlers.handleUnhandledRejection);
  }

  // Mark as registered in the persisted global state
  handlers.registered = true;
  log.debug('Database cleanup handlers registered');
}
