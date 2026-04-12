import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { searchProfessorsHandler } from '#src/controllers/professors.controller.ts';

const router = Router();
router.use(authMiddleware);

// POST /professors/search — search for professors by research interest
router.post('/search', searchProfessorsHandler);

export default router;
