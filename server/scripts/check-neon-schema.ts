/**
 * check-neon-schema.ts
 *
 * Verifies that all Module 1 tables exist on the Neon (or configured) DB.
 * Prints counts for each table and exits 1 if any are missing.
 *
 * Usage:
 *   DATABASE_URL=<neon-url> tsx scripts/check-neon-schema.ts
 *   # or rely on .env (DATABASE_URL / DATABASE_URL_CLOUD)
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/client.ts';

async function main() {
  const url =
    process.env.DATABASE_URL ??
    process.env.DATABASE_URL_CLOUD ??
    process.env.DATABASE_URL_LOCAL;

  if (!url) {
    console.error('❌  No database URL found in environment (DATABASE_URL / DATABASE_URL_CLOUD / DATABASE_URL_LOCAL).');
    process.exit(1);
  }

  const host = (() => { try { return new URL(url).hostname; } catch { return url.slice(0, 40); } })();
  console.log(`\nChecking schema on: ${host}\n`);

  const pool   = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter: pool });

  type Result = { ok: boolean; count?: number; error?: string };
  const results: Record<string, Result> = {};

  const checks: Array<[string, () => Promise<number>]> = [
    ['countries',    () => prisma.country.count()],
    ['universities', () => prisma.university.count()],
    ['programs',     () => prisma.program.count()],
    ['requirements', () => prisma.programRequirement.count()],
    ['deadlines',    () => prisma.programDeadline.count()],
  ];

  for (const [table, fn] of checks) {
    try {
      results[table] = { ok: true, count: await fn() };
    } catch (e) {
      results[table] = { ok: false, error: String(e) };
    }
  }

  let allOk = true;
  for (const [table, r] of Object.entries(results)) {
    if (r.ok) {
      console.log(`  ✓  ${table.padEnd(15)} ${r.count} records`);
    } else {
      console.log(`  ✗  ${table.padEnd(15)} MISSING — ${r.error}`);
      allOk = false;
    }
  }

  if (!allOk) {
    console.error('\n⚠  Some Module 1 tables are missing. Apply migrations with:');
    console.error('   NODE_ENV=production npm run db:migrate:deploy\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('\n✓  All Module 1 tables exist.\n');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
