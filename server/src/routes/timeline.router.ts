import { Router } from 'express';
import {
  getTimelineInputs,
  generateTimeline,
  getLatestTimeline,
  updateTaskStatus,
} from '#src/controllers/timeline.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.ts';

const router = Router();

// GET  /timeline/inputs?countryCode=US  — profile + saved programs + visa template
router.get('/inputs', authMiddleware, getTimelineInputs);

// POST /timeline/generate  — generate & persist UserRoadmap
router.post('/generate', authMiddleware, generateTimeline);

// GET  /timeline/latest?countryCode=US  — latest UserRoadmap
router.get('/latest', authMiddleware, getLatestTimeline);

// PATCH /timeline/tasks — update a single task status
router.patch('/tasks', authMiddleware, updateTaskStatus);

export default router;
