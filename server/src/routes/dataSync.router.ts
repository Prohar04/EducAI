import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { dataSyncRunHandler, dataSyncStatusHandler } from '#src/controllers/dataSync.controller.ts';

const router = Router();

// GET /data-sync/status — get sync status (public for cron monitoring)
router.get('/status', authMiddleware, dataSyncStatusHandler);

// POST /data-sync/run — trigger a sync run (authenticated users or cron secret)
router.post('/run', dataSyncRunHandler);

export default router;
