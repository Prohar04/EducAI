import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { sopGenerateHandler } from '#src/controllers/sop.controller.ts';

const router = Router();
router.use(authMiddleware);

// POST /sop/generate — generate an SOP using profile context + LLM
router.post('/generate', sopGenerateHandler);

export default router;
