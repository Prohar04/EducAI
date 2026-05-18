import { Router } from "express"
import type { Request, Response } from "express"
import { authenticateCron } from "#src/middlewares/authenticateCron.ts"
import logger from "#src/config/logger.ts"
import prisma from "#src/config/database.ts"

const router = Router()
const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8001"
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY || ""

// News is cached in the `news_cache` DB table so it survives across
// serverless invocations on Vercel (both this backend and the AI server).
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

const ALL_CATEGORIES = ["university", "visa", "scholarship", "general"]

async function fetchCategoryFromAiServer(category: string): Promise<unknown[] | null> {
  const url = new URL(`${AI_SERVER_URL}/api/v1/news/education`)
  url.searchParams.set("category", category)

  try {
    const aiRes = await fetch(url.toString(), {
      headers: { "X-API-Key": AI_SERVER_API_KEY },
      signal: AbortSignal.timeout(30000),
    })
    if (!aiRes.ok) return null
    const data = await aiRes.json() as { categories?: Record<string, unknown[]> }
    return data.categories?.[category] ?? null
  } catch {
    return null
  }
}

// ── GET /api/news/education ───────────────────────────────────────────────────
router.get("/education", async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined
  const requested = category && ALL_CATEGORIES.includes(category) ? [category] : ALL_CATEGORIES

  try {
    const response: Record<string, unknown[]> = {}
    const staleCategories: string[] = []

    // Load whatever is in the DB for each requested category
    const rows = await prisma.newsCache.findMany({
      where: { category: { in: requested } },
    })
    const dbMap = new Map(rows.map((r) => [r.category, r]))

    for (const cat of requested) {
      const row = dbMap.get(cat)
      if (row && Date.now() - row.fetchedAt.getTime() < CACHE_TTL_MS) {
        response[cat] = row.articles as unknown[]
      } else {
        staleCategories.push(cat)
        // Serve stale while refreshing below
        if (row) response[cat] = row.articles as unknown[]
      }
    }

    // Refresh stale categories in background (don't block the response)
    if (staleCategories.length > 0) {
      Promise.all(
        staleCategories.map(async (cat) => {
          const articles = await fetchCategoryFromAiServer(cat)
          if (!articles) return
          await prisma.newsCache.upsert({
            where: { category: cat },
            update: { articles: articles as object[], fetchedAt: new Date() },
            create: { category: cat, articles: articles as object[], fetchedAt: new Date() },
          })
          // Populate response for categories with no stale data
          if (!(cat in response)) response[cat] = articles
        })
      ).catch((err) => logger.error("Background news refresh error:", { err }))
    }

    res.set("Cache-Control", "public, max-age=3600")
    res.json({
      categories: response,
      fetched_at: new Date().toISOString(),
    })
  } catch (err) {
    logger.error("News fetch error:", { err })
    res.status(500).json({ error: "Failed to fetch news", categories: {} })
  }
})

// ── POST /api/news/refresh ────────────────────────────────────────────────────
router.post("/refresh", authenticateCron, async (_req: Request, res: Response) => {
  const results: Record<string, string> = {}
  let anySuccess = false

  await Promise.all(
    ALL_CATEGORIES.map(async (cat) => {
      const articles = await fetchCategoryFromAiServer(cat)
      if (!articles) {
        results[cat] = "failed"
        return
      }
      await prisma.newsCache.upsert({
        where: { category: cat },
        update: { articles: articles as object[], fetchedAt: new Date() },
        create: { category: cat, articles: articles as object[], fetchedAt: new Date() },
      })
      results[cat] = "ok"
      anySuccess = true
    })
  )

  logger.info("News refresh complete:", results)

  if (!anySuccess) {
    res.status(503).json({ success: false, results, timestamp: new Date().toISOString() })
    return
  }

  res.json({ success: true, results, timestamp: new Date().toISOString() })
})

export default router
