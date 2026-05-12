import winston from 'winston';

// ── Winston Logger Configuration ───────────────────────────────────────────────
// Centralized logging for Express API services.
// In production/container environments, logs go to stdout/stderr.
// In development, logs are also written to local files.

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  /**
   * Log Level
   */
  level: process.env.LOG_LEVEL || 'info',

  /**
   * Format Configuration
   */
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  /**
   * Default Metadata
   */
  defaultMeta: { service: 'acquisition-api' },

  /**
   * Transports
   * Production: console only, so Render can capture logs.
   * Development: console + local files.
   */
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
      format: isProduction
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          )
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
    }),
  ],
});

// File logs only in development/local environments
if (!isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}

export default logger;