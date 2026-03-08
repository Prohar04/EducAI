import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { getUserProfile, upsertUserProfile } from '#src/controllers/user.controller.ts';

const router = Router();

router.get('/me/profile', authMiddleware, getUserProfile);
router.post('/me/profile', authMiddleware, upsertUserProfile);
router.put('/me/profile', authMiddleware, upsertUserProfile);

export default router;
