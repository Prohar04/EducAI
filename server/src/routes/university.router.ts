import { Router } from 'express';
import { searchUniversities } from '#src/controllers/university.controller.ts';

const router = Router();

// GET /universities?country=US&q=mit&page=1&limit=20
router.get('/', searchUniversities);

export default router;
