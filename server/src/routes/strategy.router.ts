import { Router } from 'express';
import { generateStrategy, getLatestStrategy } from '#src/controllers/strategy.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.ts';

const router = Router();

// POST /strategy/generate  — LLM strategy report (cached)
router.post('/generate', authMiddleware, generateStrategy);

// GET /strategy/latest?countryCode=US  — latest StrategyReport
router.get('/latest', authMiddleware, getLatestStrategy);

export default router;
