import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import {
  listScholarships,
  getScholarship,
  listUpcomingDeadlines,
  listEligibleScholarships,
  checkScholarshipEligibility,
  getScholarshipProbability,
  refreshScholarships,
} from '#src/controllers/scholarship.controller.ts';

const router = Router();

// All scholarship routes require authentication
router.use(authMiddleware);

// GET /scholarships — search/filter scholarships
router.get('/', listScholarships);

// GET /scholarships/eligible — get scholarships user is eligible for
router.get('/eligible', listEligibleScholarships);

// GET /scholarships/deadlines — upcoming scholarship deadlines
router.get('/deadlines', listUpcomingDeadlines);

// POST /scholarships/refresh/live — trigger live scholarship refresh
router.post('/refresh/live', refreshScholarships);

// GET /scholarships/:id — get single scholarship
router.get('/:id', getScholarship);

// POST /scholarships/:id/eligibility — detailed eligibility check
router.post('/:id/eligibility', checkScholarshipEligibility);

// POST /scholarships/:id/probability — funding probability prediction
router.post('/:id/probability', getScholarshipProbability);

export default router;
