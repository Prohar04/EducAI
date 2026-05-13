import { Router } from 'express';
import type { Request, Response } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { authenticateCron } from '#src/middlewares/authenticateCron.ts';
import prisma from '#src/config/database.ts';

const router = Router();

// GET /freshness — requires user authentication
router.use(authMiddleware);

const THRESHOLDS_HOURS: Record<string, number> = {
  jobs: 3, news: 3, currency: 12,
  scholarships: 48, programs: 48, visa: 48, professors: 48,
}

const SOURCE_NEXT_HOURS: Record<string, number> = {
  jobs: 1, news: 1, currency: 6,
  scholarships: 24, programs: 24, visa: 24, professors: 24,
}

// GET /freshness — list all data sources with staleness info
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const records = await prisma.dataFreshness.findMany({
      orderBy: { source: 'asc' },
    })

    const now = new Date()
    const enriched = records.map(r => {
      const lastSync = new Date(r.lastSyncAt)
      const diffMs = now.getTime() - lastSync.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)

      let relativeTime: string
      if (diffMin < 1) relativeTime = 'Just now'
      else if (diffMin < 60) relativeTime = `${diffMin}m ago`
      else if (diffHours < 24) relativeTime = `${diffHours}h ago`
      else relativeTime = `${Math.floor(diffHours / 24)}d ago`

      const threshold = THRESHOLDS_HOURS[r.source] ?? 48
      const staleness =
        diffHours > threshold ? 'stale' :
        diffHours > threshold / 2 ? 'warning' : 'fresh'

      const nextSyncIn = r.nextSyncAt
        ? Math.max(0, Math.round((new Date(r.nextSyncAt).getTime() - now.getTime()) / 60000))
        : null

      return { ...r, relativeTime, staleness, nextSyncIn }
    })

    res.json({ sources: enriched, fetchedAt: now.toISOString() })
  } catch {
    res.status(500).json({ error: 'Failed to fetch freshness data' })
  }
})

// POST /freshness/update — upsert freshness record (called by cron jobs) — requires cron auth
router.post('/update', authenticateCron, async (req: Request, res: Response): Promise<void> => {
  try {
    const { source, recordCount, status, details } = req.body as {
      source: string
      recordCount?: number
      status?: string
      details?: Record<string, unknown>
    }
    if (!source) { res.status(400).json({ error: 'source is required' }); return }

    const hours = SOURCE_NEXT_HOURS[source] ?? 24
    await prisma.dataFreshness.upsert({
      where: { source },
      update: {
        lastSyncAt: new Date(),
        status: status ?? 'success',
        recordCount: recordCount ?? 0,
        details: details ? JSON.stringify(details) : null,
        nextSyncAt: new Date(Date.now() + hours * 3600000),
        errorMessage: null,
      },
      create: {
        source,
        lastSyncAt: new Date(),
        status: status ?? 'success',
        recordCount: recordCount ?? 0,
        nextSyncAt: new Date(Date.now() + hours * 3600000),
      },
    })
    res.json({ ok: true, source })
  } catch {
    res.status(500).json({ error: 'Failed to update freshness' })
  }
})

export default router
