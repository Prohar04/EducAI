import { Router } from 'express';
import { searchPrograms, getProgramById } from '#src/controllers/program.controller.ts';
import { optionalAuthMiddleware } from '#src/middlewares/authenticate.ts';
import prisma from '#src/config/database.ts';

const router = Router();

// GET /programs — optional auth enables global profile-aware ranking for signed-in users
router.get('/', optionalAuthMiddleware, searchPrograms);

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
