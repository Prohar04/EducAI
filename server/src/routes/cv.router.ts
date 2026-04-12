import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { cvGenerateHandler } from '#src/controllers/cv.controller.ts';

const router = Router();
router.use(authMiddleware);

// POST /cv/generate — generate a CV using profile context + LLM
router.post('/generate', cvGenerateHandler);

export default router;
