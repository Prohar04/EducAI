import { Request, Response } from 'express';
import { performIngest, CountryInput } from '#services/ingest.service.ts';
import prisma from '#src/config/database.ts';

// ── Security ─────────────────────────────────────────────────────────────── //

const CONFIGURED_KEY = process.env.INGEST_API_KEY;

function verifyIngestKey(req: Request, res: Response): boolean {
  if (!CONFIGURED_KEY) {
    res.status(503).json({ error: 'INGEST_API_KEY is not configured on this server' });
    return false;
  }
  const provided = req.headers['x-ingest-key'];
  if (!provided || provided !== CONFIGURED_KEY) {
    res.status(401).json({ error: 'Unauthorized: missing or invalid X-INGEST-KEY header' });
    return false;
  }
  return true;
}

// ── Payload types ─────────────────────────────────────────────────────────── //

interface IngestPayload {
  source:    string;
  runId:     string;
  countries: CountryInput[];
}

// ── POST /internal/module1/ingest ─────────────────────────────────────────── //

export const ingestModule1 = async (req: Request, res: Response) => {
  if (!verifyIngestKey(req, res)) return;

  const body = req.body as IngestPayload;
  if (!Array.isArray(body?.countries) || body.countries.length === 0) {
    res.status(400).json({ error: 'payload.countries must be a non-empty array' });
    return;
  }

  try {
    const counts = await performIngest(body.countries, body.runId);
    res.status(200).json({ ok: true, upserted: counts, runId: body.runId });
  } catch (err) {
    console.error('[ingest] error:', err);
    res.status(500).json({ ok: false, error: 'Ingestion failed', details: String(err) });
  }
};

// ── GET /internal/module1/stats ───────────────────────────────────────────── //

export const getModule1Stats = async (req: Request, res: Response) => {
  if (!verifyIngestKey(req, res)) return;

  try {
    const [countries, universities, programs, requirements, deadlines, matchRuns, matchResults] =
      await Promise.all([
        prisma.country.count(),
        prisma.university.count(),
        prisma.program.count(),
        prisma.programRequirement.count(),
        prisma.programDeadline.count(),
        prisma.matchRun.count(),
        prisma.matchResult.count(),
      ]);
    res.status(200).json({ countries, universities, programs, requirements, deadlines, matchRuns, matchResults });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', details: String(err) });
  }
};
