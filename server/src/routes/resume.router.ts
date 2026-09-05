import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { resumeGenerateHandler, resumeDownloadPdfHandler } from '#src/controllers/resume.controller.ts';
import { aiRateLimit } from '#src/middlewares/rateLimit.ts';

const router = Router();
router.use(authMiddleware);
// Per-caller quota on the paid generation paths (POST only).
router.use(aiRateLimit);

router.post('/generate', resumeGenerateHandler);
router.post('/download-pdf', resumeDownloadPdfHandler);

export default router;
