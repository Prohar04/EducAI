import { Router } from 'express';
import { generateStrategy, getLatestStrategy } from '#src/controllers/strategy.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { aiRateLimit } from '#src/middlewares/rateLimit.ts';

const router = Router();

// POST /strategy/generate  — LLM strategy report (cached)
router.post('/generate', authMiddleware, aiRateLimit, generateStrategy);

// GET /strategy/latest?countryCode=US  — latest StrategyReport
router.get('/latest', authMiddleware, aiRateLimit, getLatestStrategy);

export default router;
