import path from 'node:path';
import fs from 'node:fs';
import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { getGapFixUploadDir } from '#src/config/paths.ts';
import {
  gapFixGenerateHandler,
  gapFixGetSessionHandler,
  gapFixUpdateGapStatusHandler,
  gapFixAddImprovementHandler,
  gapFixAddEvidenceHandler,
  gapFixDeleteEvidenceHandler,
  gapFixReanalyzeHandler,
} from '#src/controllers/gapfix.controller.ts';

const UPLOAD_DIR = getGapFixUploadDir();
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();
router.use(authMiddleware);

// Analysis
router.post('/analyze', gapFixGenerateHandler);

// Session
router.get('/session', gapFixGetSessionHandler);
router.patch('/session/:id/status', gapFixUpdateGapStatusHandler);
router.post('/session/:id/improvement', gapFixAddImprovementHandler);
router.post('/session/:id/reanalyze', gapFixReanalyzeHandler);

// Evidence
router.post('/session/:id/evidence', upload.single('file'), gapFixAddEvidenceHandler);
router.delete('/evidence/:evidenceId', gapFixDeleteEvidenceHandler);

export default router;
