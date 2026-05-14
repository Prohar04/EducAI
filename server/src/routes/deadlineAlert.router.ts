import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { authenticateCron } from '#src/middlewares/authenticateCron.ts';
import {
  triggerAlertRun,
  listPendingAlerts,
  listRecentAlerts,
  getAlertCount,
} from '#src/controllers/deadlineAlert.controller.ts';

const router = Router();

// Cron-only: protected by CRON_SECRET (Authorization: Bearer <token>)
router.post('/run', authenticateCron, triggerAlertRun);

// User-authenticated endpoints
router.get('/pending', authMiddleware, listPendingAlerts);
router.get('/recent',  authMiddleware, listRecentAlerts);
router.get('/count',   authMiddleware, getAlertCount);

export default router;
