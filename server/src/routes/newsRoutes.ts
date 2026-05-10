import { Router } from "express"
import type { Request, Response } from "express"
import { authMiddleware } from "../middlewares/authenticate.ts"

const router = Router()
const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8001"
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY || ""

router.get("/education", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined
    const url = new URL(`${AI_SERVER_URL}/api/v1/news/education`)
    if (category) url.searchParams.set("category", category)

    const aiRes = await fetch(url.toString(), {
      headers: { "X-API-Key": AI_SERVER_API_KEY },
      signal: AbortSignal.timeout(15000),
    })

    if (!aiRes.ok) {
      return res.status(502).json({ error: "AI server unavailable", categories: {} })
    }

    const data = await aiRes.json()
    res.set("Cache-Control", "public, max-age=3600")
    res.json(data)
  } catch (err) {
    console.error("News fetch error:", err)
    res.status(500).json({ error: "Failed to fetch news", categories: {} })
  }
})

router.post("/refresh", authMiddleware, async (req: Request, res: Response) => {
  try {
    const aiRes = await fetch(`${AI_SERVER_URL}/api/v1/news/refresh`, {
      method: "POST",
      headers: { "X-API-Key": AI_SERVER_API_KEY },
      signal: AbortSignal.timeout(120000),
    })
    const data = await aiRes.json()
    res.json(data)
  } catch (err) {
    console.error("News refresh error:", err)
    res.status(500).json({ error: "Refresh failed" })
  }
})

export default router
