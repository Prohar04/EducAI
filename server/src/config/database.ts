import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client.ts';

const node_env = process.env.NODE_ENV;

/**
 * Resolve the database connection string.
 * Priority:
 *   1. DATABASE_URL — explicit override (forces a specific DB regardless of NODE_ENV)
 *   2. NODE_ENV=development => DATABASE_URL_LOCAL
 *   3. otherwise           => DATABASE_URL_CLOUD
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

// Log the target host on startup (password is never printed)
const dbHost = (() => {
  try { return new URL(connectionString).hostname; } catch { return '<unparseable>'; }
})();
console.log(`[db] connecting to host=${dbHost} NODE_ENV=${node_env ?? 'unset'}`);

const pool = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter: pool });

export default prisma;
