import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { careerPredictHandler } from '#src/controllers/career.controller.ts';

const router = Router();
router.use(authMiddleware);

// POST /career/predict — predict career outcomes based on profile
router.post('/predict', careerPredictHandler);

export default router;
