import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { intelligentSearchHandler, listCachedSearches } from '#src/controllers/search.controller.ts';
import { aiRateLimit } from '#src/middlewares/rateLimit.ts';

const router = Router();

// All search routes require authentication
router.use(authMiddleware);
// Per-caller quota on the paid generation paths (POST only).
router.use(aiRateLimit);

// POST /search/intelligent — NLP search with LLM query rewrite + Serper + PostgreSQL cache
router.post('/intelligent', intelligentSearchHandler);

// GET /search/cached — list recent cached searches
router.get('/cached', listCachedSearches);

export default router;
