import winston from 'winston';

// ── Winston Logger Configuration ───────────────────────────────────────────────
// Production/container-safe logging.
// Logs go to stdout/stderr by default so Render can capture them.
// File logs are disabled unless ENABLE_FILE_LOGGING=true.

const enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  defaultMeta: { service: 'acquisition-api' },

  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

// Only enable local file logs if explicitly requested.
// Do NOT enable this on Render unless you also create/chown the logs directory.
if (enableFileLogging) {
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