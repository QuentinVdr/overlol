type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  prefix?: string;
  enableDebug?: boolean;
}

class Logger {
  private prefix: string;
  private enableDebug: boolean;

  constructor(config: LoggerConfig = {}) {
    this.prefix = config.prefix || '';
    this.enableDebug = config.enableDebug ?? process.env.NODE_ENV === 'development';
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
    return new Logger({
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      enableDebug: this.enableDebug,
    });
  }
}

// Export a default logger instance
export const logger = new Logger();

// Export the Logger class for creating custom instances
export { Logger };
