import winston from 'winston';

// ── Winston Logger Configuration ───────────────────────────────────────────────
// Centralized logging for all Express API services.
// Logs are written to files and console (non-production only).
// All logs include timestamp, service name, and error stack traces.

const logger = winston.createLogger({
  /**
   * Log Level
   * Determines minimum severity of messages to log (debug < info < warn < error).
   * Default: 'info'
   * Set LOG_LEVEL environment variable to override (e.g., 'debug' for verbose).
   */
  level: process.env.LOG_LEVEL || 'info',

  /**
   * Format Configuration
   * - timestamp(): Adds ISO timestamp to every log
   * - errors(): Captures full stack traces for Error objects
   * - json(): Outputs structured JSON for easy parsing
   */
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  /**
   * Default Metadata
   * Every log entry includes service name for distributed tracing.
   */
  defaultMeta: { service: 'acquisition-api' },

  /**
   * Transports: Where logs are written
   * - Error logs: logs/error.log (level=error only)
   * - Combined logs: logs/combined.log (all levels)
   */
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// ── Console Output (Development Only) ──────────────────────────────────────────
// In development, also output logs to console with colors for readability.
// In production, only file-based logging is used (cleaner for container logs).
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
