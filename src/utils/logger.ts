type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  prefix?: string;
  enableDebug?: boolean;
}

class Logger {
  private readonly prefix: string;
  private readonly enableDebug: boolean;
  // Cache child loggers to prevent creating duplicate instances
  private readonly childrenCache: Map<string, Logger>;

  constructor(config: LoggerConfig = {}) {
    this.prefix = config.prefix || '';
    this.enableDebug = config.enableDebug ?? process.env.NODE_ENV === 'development';
    this.childrenCache = new Map();
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const prefixStr = this.prefix ? `[${this.prefix}] ` : '';
    return `[${timestamp}] ${levelStr} ${prefixStr}${message}`;
  }

  debug(message: string, ...args: unknown[]) {
    if (this.enableDebug) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]) {
    console.log(this.formatMessage('info', message), ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(this.formatMessage('warn', message), ...args);
  }

  error(message: string, error?: unknown, ...args: unknown[]) {
    console.error(this.formatMessage('error', message), ...args);
    if (error) {
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      } else {
        console.error('Error details:', error);
      }
    }
  }

  child(prefix: string): Logger {
    // Return cached child logger if it exists
    if (this.childrenCache.has(prefix)) {
      return this.childrenCache.get(prefix)!;
    }

    // Create new child logger and cache it
    const childLogger = new Logger({
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      enableDebug: this.enableDebug,
    });

    this.childrenCache.set(prefix, childLogger);
    return childLogger;
  }

  /**
   * Clear the child logger cache (useful for testing or memory cleanup)
   */
  clearCache(): void {
    this.childrenCache.clear();
  }

  /**
   * Get the number of cached child loggers
   */
  getCacheSize(): number {
    return this.childrenCache.size;
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export the Logger class for creating custom instances
export { Logger };
