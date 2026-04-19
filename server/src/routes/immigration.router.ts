import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { immigrationGuideHandler } from '#src/controllers/immigration.controller.ts';

const router = Router();
router.use(authMiddleware);

// POST /immigration/guide — get PR & visa pathway guidance for target countries
router.post('/guide', immigrationGuideHandler);

export default router;
