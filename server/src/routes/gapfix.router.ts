import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { gapFixGenerateHandler } from '#src/controllers/gapfix.controller.ts';

const router = Router();
router.use(authMiddleware);

// POST /gap-fix/analyze — analyze profile gaps and return recommendations
router.post('/analyze', gapFixGenerateHandler);

export default router;
