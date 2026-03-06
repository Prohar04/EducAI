import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import {
  getSavedPrograms,
  saveProgram,
  unsaveProgram,
} from '#src/controllers/savedProgram.controller.ts';

const router = Router();

// GET /saved-programs  (auth required)
router.get('/', authMiddleware, getSavedPrograms);

// POST /saved-programs  (auth required)
router.post('/', authMiddleware, saveProgram);

// DELETE /saved-programs/:programId  (auth required)
router.delete('/:programId', authMiddleware, unsaveProgram);

export default router;
