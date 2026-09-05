import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { immigrationGuideHandler } from '#src/controllers/immigration.controller.ts';
import { aiRateLimit } from '#src/middlewares/rateLimit.ts';

const router = Router();
router.use(authMiddleware);
// Per-caller quota on the paid generation paths (POST only).
router.use(aiRateLimit);

// POST /immigration/guide — get PR & visa pathway guidance for target countries
router.post('/guide', immigrationGuideHandler);

export default router;
