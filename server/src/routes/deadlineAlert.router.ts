import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import {
  triggerAlertRun,
  listPendingAlerts,
  listRecentAlerts,
  getAlertCount,
} from '#src/controllers/deadlineAlert.controller.ts';

const router = Router();

// Public-ish endpoint: protected by CRON_SECRET header, not user auth
// Safe to call from a scheduler (GitHub Actions, cron, Vercel cron, etc.)
router.post('/run', triggerAlertRun);

// User-authenticated endpoints
router.get('/pending', authMiddleware, listPendingAlerts);
router.get('/recent',  authMiddleware, listRecentAlerts);
router.get('/count',   authMiddleware, getAlertCount);

export default router;
