/**
 * A utility for enhanced logging functionality
 * Provides structured logs with timestamps, log levels, and context
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Current log level - can be configured from environment or settings
const currentLogLevel = LogLevel.DEBUG; // Default to DEBUG level

interface LoggerOptions {
  context?: string;
  enableConsole?: boolean;
}

/**
 * Format the current timestamp for logs
 * @returns Formatted timestamp string
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Creates a logger instance with optional context
 * @param options Logger configuration options
 * @returns Logger object with logging methods
 */
export const createLogger = (options: LoggerOptions = {}) => {
  const { 
    context = '',
    enableConsole = true 
  } = options;
  
  const contextPrefix = context ? `[${context}]` : '';
  
  /**
   * Log a message with specific level and optional data
   */
  const logWithLevel = (level: LogLevel, message: string, ...data: any[]) => {
    // Skip logging if current level is higher than the requested log level
    if (level < currentLogLevel) return;
    
    const timestamp = getTimestamp();
    const levelStr = LogLevel[level];
    const prefix = `${timestamp} [${levelStr}]${contextPrefix}`;
    
    if (enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          if (data.length > 0) {
            console.debug(`${prefix} ${message}`, ...data);
          } else {
            console.debug(`${prefix} ${message}`);
          }
          break;
        case LogLevel.INFO:
          if (data.length > 0) {
            console.log(`${prefix} ${message}`, ...data);
          } else {
            console.log(`${prefix} ${message}`);
          }
          break;
        case LogLevel.WARN:
          if (data.length > 0) {
            console.warn(`${prefix} ${message}`, ...data);
          } else {
            console.warn(`${prefix} ${message}`);
          }
          break;
        case LogLevel.ERROR:
          if (data.length > 0) {
            console.error(`${prefix} ${message}`, ...data);
          } else {
            console.error(`${prefix} ${message}`);
          }
          break;
      }
    }
  };
  
  return {
    debug: (message: string, ...data: any[]) => 
      logWithLevel(LogLevel.DEBUG, message, ...data),
      
    info: (message: string, ...data: any[]) => 
      logWithLevel(LogLevel.INFO, message, ...data),
      
    warn: (message: string, ...data: any[]) => 
      logWithLevel(LogLevel.WARN, message, ...data),
      
    error: (message: string, ...data: any[]) => 
      logWithLevel(LogLevel.ERROR, message, ...data),
  };
};

// Create default logger instance
const defaultLogger = createLogger();
export default defaultLogger;