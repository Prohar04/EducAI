import { Router } from "express";
import { authMiddleware } from "#src/middlewares/authenticate.ts";
import {
  searchJobs,
  getJobSuggestions,
  getJobHistory,
  getJobRefreshStatus,
  triggerBackgroundRefresh,
} from "#src/controllers/jobController.ts";

const router = Router();

// Public (no auth required) — suggestion endpoint for client-side combobox
router.get("/suggest", getJobSuggestions);

// Protected — all job search endpoints require authentication
router.use(authMiddleware);
router.post("/search", searchJobs);
router.get("/history", getJobHistory);
router.get("/refresh-status", getJobRefreshStatus);
router.post("/background-refresh", triggerBackgroundRefresh);

export default router;
