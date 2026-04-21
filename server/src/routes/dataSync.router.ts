import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import {
  dataSyncRunHandler,
  dataSyncStatusHandler,
  dataSyncHistoryHandler,
} from '#src/controllers/dataSync.controller.ts';

const router = Router();

// GET /data-sync/status — overall health, per-source status, recent runs
router.get('/status', authMiddleware, dataSyncStatusHandler);

// GET /data-sync/history — paginated run history
router.get('/history', authMiddleware, dataSyncHistoryHandler);

// POST /data-sync/run — trigger a sync (authenticated users or cron secret)
router.post('/run', dataSyncRunHandler);

export default router;
