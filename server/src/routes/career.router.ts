import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { careerPredictHandler } from '#src/controllers/career.controller.ts';
import { aiRateLimit } from '#src/middlewares/rateLimit.ts';

const router = Router();
router.use(authMiddleware);
// Per-caller quota on the paid generation paths (POST only).
router.use(aiRateLimit);

// POST /career/predict — predict career outcomes based on profile
router.post('/predict', careerPredictHandler);

export default router;
