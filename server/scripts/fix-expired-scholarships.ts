/**
 * One-time fix script: mark scholarships with all-past deadlines as inactive.
 * Safe to run multiple times (idempotent).
 *
 * Usage:
 *   npx tsx scripts/fix-expired-scholarships.ts
 */

import 'dotenv/config';
import prisma from '../src/config/database.ts';

async function main() {
  const now = new Date();
  console.log(`[fix-expired-scholarships] Running at ${now.toISOString()}`);

  // Find active scholarships that have at least one deadline but NO future deadline
  const toExpire = await prisma.scholarship.findMany({
    where: {
      isActive: true,
      deadlines: { some: {} },
      NOT: { deadlines: { some: { deadline: { gte: now } } } },
    },
    select: { id: true, title: true },
  });

  if (toExpire.length === 0) {
    console.log('[fix-expired-scholarships] No expired scholarships found — nothing to do.');
  } else {
    console.log(`[fix-expired-scholarships] Found ${toExpire.length} scholarships to expire:`);
    for (const s of toExpire) {
      console.log(`  - ${s.title}`);
    }

    await prisma.scholarship.updateMany({
      where: { id: { in: toExpire.map(s => s.id) } },
      data: { isActive: false },
    });

    console.log(`[fix-expired-scholarships] ✅ Marked ${toExpire.length} scholarships as inactive.`);
  }

  // Update lastVerified on all still-active scholarships
  const verified = await prisma.scholarship.updateMany({
    where: { isActive: true },
    data: { lastVerified: now },
  });
  console.log(`[fix-expired-scholarships] ✅ Updated lastVerified on ${verified.count} active scholarships.`);

  // Final counts
  const [total, active] = await Promise.all([
    prisma.scholarship.count(),
    prisma.scholarship.count({ where: { isActive: true } }),
  ]);
  console.log(`[fix-expired-scholarships] Summary: total=${total} active=${active} inactive=${total - active}`);
}

main()
  .catch(err => {
    console.error('[fix-expired-scholarships] Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
