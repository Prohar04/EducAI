import prisma from "#src/config/database.ts"

const SOURCES: Array<{ source: string; nextHours: number; recordCount: number }> = [
  { source: "jobs",         nextHours: 1,  recordCount: 0 },
  { source: "news",         nextHours: 1,  recordCount: 0 },
  { source: "scholarships", nextHours: 24, recordCount: 28 },
  { source: "programs",     nextHours: 24, recordCount: 0 },
  { source: "currency",     nextHours: 6,  recordCount: 0 },
  { source: "visa",         nextHours: 24, recordCount: 0 },
  { source: "professors",   nextHours: 24, recordCount: 0 },
]

async function main() {
  const now = new Date()
  for (const s of SOURCES) {
    await prisma.dataFreshness.upsert({
      where: { source: s.source },
      update: {},
      create: {
        source: s.source,
        lastSyncAt: now,
        status: "success",
        recordCount: s.recordCount,
        nextSyncAt: new Date(now.getTime() + s.nextHours * 3600000),
      },
    })
    console.log(`Seeded freshness for: ${s.source}`)
  }
  console.log("Freshness seed complete")
}

main().finally(() => prisma.$disconnect().catch(() => {}))
