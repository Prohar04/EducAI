import { Router } from 'express';
import { matchPrograms } from '#src/controllers/match.controller.ts';

const router = Router();

// POST /match/programs
router.post('/programs', matchPrograms);

export default router;
