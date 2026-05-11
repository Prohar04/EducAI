import { Router } from 'express';
import type { Request, Response } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { cvGenerateHandler } from '#src/controllers/cv.controller.ts';
import { generatePDF } from '#src/services/pdfGeneratorService.ts';

const router = Router();
router.use(authMiddleware);

// POST /cv/generate — generate a CV using profile context + LLM
router.post('/generate', cvGenerateHandler);

// POST /cv/download-pdf — render CV content to a PDF file
router.post('/download-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, template = 'us_standard' } = req.body as {
      content: string;
      template?: string;
    };
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'content is required' });
      return;
    }
    const pdfBuffer = await generatePDF({
      content,
      documentType: 'cv',
      template,
      authorName: 'Student',
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CV-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('CV PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

export default router;
