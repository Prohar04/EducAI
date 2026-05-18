import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import prisma from '#src/config/database.ts';
import { uploadEvidencePDF, deleteEvidencePDF } from '#src/services/supabaseStorageService.ts';
import logger from '#src/config/logger.ts';

const router = Router();
router.use(authMiddleware);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
});

const AI_URL = process.env.AI_SERVER_URL || 'http://localhost:8001';
const AI_KEY = process.env.AI_SERVER_API_KEY || '';

async function callAI(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${AI_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': AI_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI server error ${res.status}: ${text}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

function calculateScore(items: Array<{ aiVerified: boolean; status: string; priority: string }>): number {
  if (!items.length) return 0;
  let totalWeight = 0;
  let earnedWeight = 0;
  const WEIGHTS: Record<string, number> = { high: 3, medium: 2, low: 1 };
  for (const item of items) {
    const w = WEIGHTS[item.priority] ?? 2;
    totalWeight += w;
    if (item.aiVerified && item.status === 'completed') earnedWeight += w;
    else if (item.aiVerified && item.status === 'in_progress') earnedWeight += w * 0.5;
  }
  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

function parseResourceLinks(raw: string | null | undefined): unknown[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as unknown[]; } catch { return []; }
}

// GET /api/gap-fix
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId as string;
  try {
    const items = await prisma.gapFixItem.findMany({
      where: { userId },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
    const score = calculateScore(items);
    res.json({
      items: items.map(i => ({ ...i, resourceLinks: parseResourceLinks(i.resourceLinks) })),
      score,
      totalItems: items.length,
      completedItems: items.filter(i => i.aiVerified && i.status === 'completed').length,
    });
  } catch {
    res.status(500).json({ error: 'Failed to load gap fix data' });
  }
});

// POST /api/gap-fix/analyze
router.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId as string;
  const { profile, targetCountries, targetField } = req.body as {
    profile?: Record<string, unknown>;
    targetCountries?: string[];
    targetField?: string;
  };

  if (!profile) { res.status(400).json({ error: 'Profile data required' }); return; }

  try {
    const analysis = await callAI('/api/v1/gap-fix/analyze', {
      profile,
      target_countries: targetCountries ?? [],
      target_field: targetField ?? 'General',
    });

    const gaps = (analysis.gaps as Array<{
      gapType: string;
      title: string;
      description: string;
      priority?: string;
      resourceLinks?: unknown[];
    }>) ?? [];

    const saved = [];
    for (const gap of gaps) {
      const existing = await prisma.gapFixItem.findFirst({
        where: { userId, gapType: gap.gapType, title: gap.title },
      });
      if (!existing) {
        const item = await prisma.gapFixItem.create({
          data: {
            userId,
            gapType: gap.gapType,
            title: gap.title,
            description: gap.description,
            priority: gap.priority ?? 'medium',
            status: 'not_started',
            resourceLinks: JSON.stringify(gap.resourceLinks ?? []),
          },
        });
        saved.push(item);
      } else {
        saved.push(existing);
      }
    }

    const score = calculateScore(saved);
    res.json({
      items: saved.map(i => ({ ...i, resourceLinks: parseResourceLinks(i.resourceLinks) })),
      score,
      totalItems: saved.length,
      completedItems: 0,
      overall_competitiveness: analysis.overall_competitiveness,
      top_strength: analysis.top_strength,
      critical_gap: analysis.critical_gap,
    });
  } catch (err) {
    logger.error('Gap Fix analyze error:', { err });
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// POST /api/gap-fix/:id/upload-pdf
router.post('/:id/upload-pdf', upload.single('pdf'), async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId as string;
  const id = req.params.id as string;

  if (!req.file) { res.status(400).json({ error: 'No PDF file uploaded' }); return; }

  const item = await prisma.gapFixItem.findFirst({ where: { id, userId } });
  if (!item) { res.status(404).json({ error: 'Gap item not found' }); return; }

  try {
    const { signedUrl, storagePath } = await uploadEvidencePDF(userId, id, req.file.buffer, req.file.originalname);
    const updated = await prisma.gapFixItem.update({
      where: { id },
      data: { pdfUrl: signedUrl, pdfStoragePath: storagePath, status: 'pending_verification', aiVerified: false },
    });
    res.json({
      success: true,
      pdfUrl: signedUrl,
      status: updated.status,
      message: "PDF uploaded. Click 'Verify with AI' to verify your evidence.",
    });
  } catch (err) {
    logger.error('PDF upload error:', { err });
    const errorMessage = err instanceof Error ? err.message : 'PDF upload failed';
    res.status(500).json({ error: errorMessage });
  }
});

// POST /api/gap-fix/:id/verify
router.post('/:id/verify', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId as string;
  const id = req.params.id as string;
  const { evidenceText, evidenceUrl } = req.body as { evidenceText?: string; evidenceUrl?: string };

  const item = await prisma.gapFixItem.findFirst({ where: { id, userId } });
  if (!item) { res.status(404).json({ error: 'Gap item not found' }); return; }

  const hasText = Boolean(evidenceText?.trim());
  const hasUrl = Boolean(evidenceUrl?.trim());
  const hasPdf = Boolean(item.pdfUrl);

  if (!hasText && !hasUrl && !hasPdf) {
    res.status(400).json({
      error: 'No evidence provided',
      message: 'Please provide at least one: written description, URL, or uploaded PDF.',
    });
    return;
  }

  try {
    const verification = await callAI('/api/v1/gap-fix/verify-evidence', {
      gap_id: id,
      gap_type: item.gapType,
      gap_title: item.title,
      gap_description: item.description,
      evidence_text: evidenceText?.trim() || item.evidenceText || null,
      evidence_url: evidenceUrl?.trim() || item.evidenceUrl || null,
      pdf_url: item.pdfUrl || null,
      current_status: item.status,
    });

    const updated = await prisma.gapFixItem.update({
      where: { id },
      data: {
        evidenceText: evidenceText?.trim() || item.evidenceText,
        evidenceUrl: evidenceUrl?.trim() || item.evidenceUrl,
        aiVerified: Boolean(verification.verified),
        aiConfidence: typeof verification.confidence === 'number' ? verification.confidence : null,
        aiFeedback: String(verification.feedback ?? ''),
        status: String(verification.new_status ?? 'not_started'),
        aiVerifiedAt: verification.verified ? new Date() : null,
      },
    });

    const allItems = await prisma.gapFixItem.findMany({ where: { userId } });
    const newScore = calculateScore(allItems);

    res.json({
      success: true,
      verified: verification.verified,
      confidence: verification.confidence,
      feedback: verification.feedback,
      new_status: verification.new_status,
      score_impact: verification.score_impact,
      new_score: newScore,
      item: { ...updated, resourceLinks: parseResourceLinks(updated.resourceLinks) },
    });
  } catch (err) {
    logger.error('Gap Fix verify error:', { err });
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// PATCH /api/gap-fix/:id/skip
router.patch('/:id/skip', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId as string;
  const id = req.params.id as string;

  const item = await prisma.gapFixItem.findFirst({ where: { id, userId } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }

  await prisma.gapFixItem.update({ where: { id }, data: { status: 'skipped', aiVerified: false } });
  const allItems = await prisma.gapFixItem.findMany({ where: { userId } });
  res.json({ success: true, new_score: calculateScore(allItems) });
});

// DELETE /api/gap-fix/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId as string;
  const id = req.params.id as string;

  const item = await prisma.gapFixItem.findFirst({ where: { id, userId } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }

  // Delete associated Supabase file if present (non-fatal)
  if (item.pdfStoragePath) {
    deleteEvidencePDF(item.pdfStoragePath).catch((err) =>
      logger.warn('[gap-fix] Failed to delete Supabase file:', { err })
    );
  }

  await prisma.gapFixItem.delete({ where: { id } });
  const allItems = await prisma.gapFixItem.findMany({ where: { userId } });
  res.json({ success: true, new_score: calculateScore(allItems) });
});

export default router;
