import { Router } from 'express';
import { searchPrograms, getProgramById } from '#src/controllers/program.controller.ts';

const router = Router();

// GET /programs?country=US&level=MSC&field=Computer%20Science&q=data&page=1&limit=20
router.get('/', searchPrograms);

// GET /programs/:id
router.get('/:id', getProgramById);

export default router;
