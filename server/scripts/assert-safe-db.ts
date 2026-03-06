/**
 * assert-safe-db.ts
 *
 * Safety guard for Prisma database commands.
 * Blocks destructive operations (migrate dev / reset / push) against remote
 * hosts (e.g. Neon) unless PRISMA_MIGRATE_ENV=production is explicitly set.
 * Also gates seed execution behind SEED_ENABLED=true.
 *
 * Usage: tsx scripts/assert-safe-db.ts <command>
 *   command: 'dev' | 'deploy' | 'reset' | 'push' | 'seed'
 */

import 'dotenv/config';

const command = process.argv[2];
const dbUrl = process.env.DATABASE_URL_CLOUD ?? process.env.DATABASE_URL ?? '';
const migrateEnv = process.env.PRISMA_MIGRATE_ENV ?? '';
const seedEnabled = process.env.SEED_ENABLED === 'true';

// Detect remote/cloud hosts
const REMOTE_PATTERN = /neon\.tech|rds\.amazonaws\.com|supabase\.co|planetscale\.com|heroku/i;
const isRemote = REMOTE_PATTERN.test(dbUrl);

// ─── Seed guard ────────────────────────────────────────────────────────────
if (command === 'seed') {
  if (!seedEnabled) {
    console.error('\n❌  Seed blocked: SEED_ENABLED is not set to "true".');
    console.error('   Add the following to your .env and re-run:');
    console.error('     SEED_ENABLED=true\n');
    process.exit(1);
  }
  if (isRemote && migrateEnv !== 'production') {
    console.error('\n❌  Seed blocked: DATABASE_URL_CLOUD points to a remote host.');
    console.error('   Seeding a production database requires explicit confirmation.');
    console.error('   If this is intentional, also set in your .env:');
    console.error('     PRISMA_MIGRATE_ENV=production\n');
    process.exit(1);
  }
  console.log('✅  Seed guard passed.\n');
  process.exit(0);
}

// ─── Destructive migration guard ────────────────────────────────────────────
const DESTRUCTIVE_COMMANDS = ['dev', 'reset', 'push'];

if (DESTRUCTIVE_COMMANDS.includes(command)) {
  if (isRemote && migrateEnv !== 'production') {
    console.error(
      `\n❌  Blocked: "migrate ${command}" is destructive and DATABASE_URL_CLOUD points to a remote host.`,
    );
    console.error('');
    console.error('   For Neon / cloud databases, use the safe deploy command:');
    console.error('     npm run db:migrate:deploy');
    console.error('');
    console.error(
      '   "migrate deploy" only applies pending migrations — it never drops or resets data.',
    );
    console.error('');
    console.error(
      `   If you REALLY intend to run "migrate ${command}" on this remote DB, set:`,
    );
    console.error('     PRISMA_MIGRATE_ENV=production');
    console.error('   in your .env and re-run.\n');
    process.exit(1);
  }
}

// ─── All checks passed ──────────────────────────────────────────────────────
process.exit(0);
