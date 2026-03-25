import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { postChat } from '#src/controllers/chat.controller.ts';

const router = Router();

router.post('/', authMiddleware, postChat);

export default router;
