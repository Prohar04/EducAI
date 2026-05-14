import { Router } from 'express';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { resumeGenerateHandler, resumeDownloadPdfHandler } from '#src/controllers/resume.controller.ts';

const router = Router();
router.use(authMiddleware);

router.post('/generate', resumeGenerateHandler);
router.post('/download-pdf', resumeDownloadPdfHandler);

export default router;
