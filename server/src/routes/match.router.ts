import { Router } from 'express';
import { runMatch, getLatestMatch, getRunStatus } from '#src/controllers/match.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.ts';

const router = Router();

// POST /match/run — AI scrape-match for authenticated user (background job)
router.post('/run', authMiddleware, runMatch);

// GET /match/latest — latest match run + results for authenticated user
router.get('/latest', authMiddleware, getLatestMatch);

// GET /match/run/:runId/status — lightweight poll for run status + progress
router.get('/run/:runId/status', authMiddleware, getRunStatus);

export default router;
