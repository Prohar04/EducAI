import { Router } from 'express';
import { ingestModule1, getModule1Stats } from '../controllers/ingest.controller.ts';

const router = Router();

/**
 * POST /internal/module1/ingest
 * Upserts scraped university / program data into Module 1 tables.
 * Protected by X-INGEST-KEY header.
 */
router.post('/module1/ingest', ingestModule1);

/**
 * GET /internal/module1/stats
 * Returns row counts for all Module 1 tables.
 * Protected by X-INGEST-KEY header.
 */
router.get('/module1/stats', getModule1Stats);

export default router;
