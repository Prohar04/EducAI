import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { searchProfessorsHandler } from '#src/controllers/professors.controller.ts';
import { aiRateLimit } from '#src/middlewares/rateLimit.ts';

const router = Router();
router.use(authMiddleware);
// Per-caller quota on the paid generation paths (POST only).
router.use(aiRateLimit);

// POST /professors/search — search for professors by research interest
router.post('/search', searchProfessorsHandler);

export default router;
