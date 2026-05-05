import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client.ts';

// ── Configuration ──────────────────────────────────────────────────────────────

const node_env = process.env.NODE_ENV;

/**
 * Resolve the database connection string based on environment.
 * Priority:
 *   1. DATABASE_URL — explicit override (forces a specific DB regardless of NODE_ENV)
 *   2. NODE_ENV=development => DATABASE_URL_LOCAL (usually localhost)
 *   3. Otherwise           => DATABASE_URL_CLOUD (production Neon)
 *
 * Throws if no connection string is found so the process fails loudly
 * instead of silently connecting to a local SQLite file.
 */
function resolveConnectionString(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  if (node_env === 'development') {
    const url = process.env.DATABASE_URL_LOCAL;
    if (!url) throw new Error('DATABASE_URL_LOCAL is required when NODE_ENV=development');
    return url;
  }
  const url = process.env.DATABASE_URL_CLOUD;
  if (!url) throw new Error('DATABASE_URL_CLOUD is required in non-development environments');
  return url;
}

const connectionString = resolveConnectionString();

// ── Connection Logging ─────────────────────────────────────────────────────────
// Log the target host on startup (password never logged for security)
const dbHost = (() => {
  try { return new URL(connectionString).hostname; } catch { return '<unparseable>'; }
})();
console.log(`[db] connecting to host=${dbHost} NODE_ENV=${node_env ?? 'unset'}`);

// ── Connection Pool Configuration ──────────────────────────────────────────────
// Neon: Serverless PostgreSQL (auto-pauses after inactivity)
// These settings are optimized for long-running operations like web scraping.
const adapter = new PrismaPg({
  connectionString,
  // Keep connections alive across the process
  // Prevents "Error { kind: Closed }" on long-running background jobs
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  idleTimeoutMillis: 60_000,       // Release unused connections after 60s
  connectionTimeoutMillis: 10_000, // Fail fast if can't acquire connection
  max: 5,                          // Max 5 connections (reasonable for serverless)
});
const prisma = new PrismaClient({ adapter });

export default prisma;
