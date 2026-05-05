import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import prisma from '#src/config/database.ts';

// ── Controllers ────────────────────────────────────────────────────────────────

/**
 * GET /saved-programs
 * Fetch all programs saved by the authenticated user.
 * Returns programs with full details: university, country, requirements, and deadlines.
 * Results ordered by most recently saved first.
 */
export const getSavedPrograms = async (req: AuthRequest, res: Response) => {
  try {
    const saved = await prisma.savedProgram.findMany({
      where: { userId: req.userId! },
      include: {
        program: {
          include: {
            university: { include: { country: true } },
            requirements: true,
            deadlines: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ savedPrograms: saved });
  } catch {
    res.status(500).json({ message: 'Failed to fetch saved programs' });
  }
};

/**
 * POST /saved-programs
 * Save a program to the authenticated user's list.
 * Body: { programId: string }
 * Returns the saved program record or updates existing.
 */
export const saveProgram = async (req: AuthRequest, res: Response) => {
  try {
    const { programId } = req.body as { programId?: string };
    if (!programId) {
      return res.status(400).json({ message: 'programId is required' });
    }

    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const saved = await prisma.savedProgram.upsert({
      where: { userId_programId: { userId: req.userId!, programId } },
      update: {},
      create: { userId: req.userId!, programId },
    });
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: 'Failed to save program' });
  }
};

/**
 * DELETE /saved-programs/:programId
 * Remove a program from the authenticated user's saved list.
 * Path parameter: programId
 */
export const unsaveProgram = async (req: AuthRequest, res: Response) => {
  try {
    const programId = Array.isArray(req.params.programId)
      ? req.params.programId[0]
      : req.params.programId;
    await prisma.savedProgram.deleteMany({
      where: { userId: req.userId!, programId },
    });
    res.status(200).json({ message: 'Program removed from saved list' });
  } catch {
    res.status(500).json({ message: 'Failed to unsave program' });
  }
};
