import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import { getLogDir } from './paths.ts';

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
  const logDir = getLogDir();
  fs.mkdirSync(logDir, { recursive: true });

  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    })
  );
}

export default logger;