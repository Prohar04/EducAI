import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { authenticateCron } from '#src/middlewares/authenticateCron.ts';
import {
  dataSyncRunHandler,
  dataSyncStatusHandler,
  dataSyncHistoryHandler,
  dataSyncJobDetailsHandler,
  dataSyncCancelHandler,
  dataSyncRetryHandler,
} from '#src/controllers/dataSync.controller.ts';

const router = Router();

// Overview status + recent runs
router.get('/status', authMiddleware, dataSyncStatusHandler);

// Paginated job history
router.get('/history', authMiddleware, dataSyncHistoryHandler);

// Full job details including raw logs, crawler details, stack trace
router.get('/job/:id', authMiddleware, dataSyncJobDetailsHandler);

// Trigger a new sync — cron only (called by data-sync.yml workflow with CRON_SECRET)
router.post('/run', authenticateCron, dataSyncRunHandler);

// Retry — cron only
router.post('/retry', authenticateCron, dataSyncRetryHandler);

// Cancel a running/stuck job
router.post('/cancel/:id', authMiddleware, dataSyncCancelHandler);

export default router;
