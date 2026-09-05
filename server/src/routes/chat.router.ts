import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { postChat } from '#src/controllers/chat.controller.ts';
import { aiRateLimit } from '#src/middlewares/rateLimit.ts';

const router = Router();

router.post('/', authMiddleware, aiRateLimit, postChat);
// Frontend proxy (web/app/api/chat/route.ts) calls POST /chat/answer — keep this
// alias in sync with '/' so the deployed route actually matches what it calls.
router.post('/answer', authMiddleware, aiRateLimit, postChat);

export default router;
