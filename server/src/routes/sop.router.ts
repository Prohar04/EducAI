import { Router } from 'express';
import type { Request, Response } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { sopGenerateHandler } from '#src/controllers/sop.controller.ts';
import { generatePDF } from '#src/services/pdfGeneratorService.ts';

const router = Router();
router.use(authMiddleware);

// POST /sop/generate — generate an SOP using profile context + LLM
router.post('/generate', sopGenerateHandler);

// POST /sop/download-pdf — render SOP content to a PDF file
router.post('/download-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, template = 'standard_academic', targetUniversity } = req.body as {
      content: string;
      template?: string;
      targetUniversity?: string;
    };
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'content is required' });
      return;
    }
    const userId = (req as unknown as { userId: string }).userId;
    const user = await import('#src/config/database.ts').then(m =>
      m.default.user.findUnique({ where: { id: userId }, select: { name: true } })
    );
    const pdfBuffer = await generatePDF({
      content,
      documentType: 'sop',
      template,
      authorName: user?.name ?? 'Student',
      targetUniversity,
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="SOP-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

export default router;
