import { Router } from 'express';
import { searchPrograms, getProgramById } from '#src/controllers/program.controller.ts';
import prisma from '#src/config/database.ts';

const router = Router();

// GET /programs?country=US&level=MSC&field=Computer%20Science&q=data&page=1&limit=20
router.get('/', searchPrograms);

// GET /programs/ids — returns all program IDs for sitemap generation (public, read-only)
router.get('/ids', async (_req, res) => {
  try {
    const programs = await prisma.program.findMany({ select: { id: true }, take: 50000 });
    res.json({ ids: programs.map((p) => p.id), total: programs.length });
  } catch {
    res.status(500).json({ ids: [], total: 0 });
  }
});

// GET /programs/:id
router.get('/:id', getProgramById);

export default router;
