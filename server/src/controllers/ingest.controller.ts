import { Request, Response } from 'express';
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

// ── Canonical payload types ───────────────────────────────────────────────── //

interface RequirementInput { key: string; value: string; }
interface DeadlineInput    { term: string; deadline: string; }

interface ProgramInput {
  title: string;
  field: string;
  level: string;
  durationMonths?: number | null;
  tuitionMinUSD?:  number | null;
  tuitionMaxUSD?:  number | null;
  description?:    string | null;
  sourceUrl?:      string | null;
  requirements?:   RequirementInput[];
  deadlines?:      DeadlineInput[];
}

interface UniversityInput {
  name:        string;
  city?:       string | null;
  website?:    string | null;
  description?: string | null;
  sourceUrl?:  string | null;
  programs?:   ProgramInput[];
}

interface CountryInput {
  code:          string;
  name:          string;
  universities?: UniversityInput[];
}

interface IngestPayload {
  source:    string;
  runId:     string;
  countries: CountryInput[];
}

// ── Level normalisation ───────────────────────────────────────────────────── //

const LEVEL_MAP: Record<string, string> = {
  BSC:           'BSC',
  MSC:           'MSC',
  PHD:           'PHD',
  BACHELOR:      'BSC',
  BACHELORS:     'BSC',
  UNDERGRADUATE: 'BSC',
  MASTER:        'MSC',
  MASTERS:       'MSC',
  GRADUATE:      'MSC',
  POSTGRADUATE:  'MSC',
  DOCTORATE:     'PHD',
  DOCTORAL:      'PHD',
};

function normalizeLevel(raw: string): string | null {
  return LEVEL_MAP[raw.toUpperCase().replace(/[^A-Z]/g, '')] ?? null;
}

// ── POST /internal/module1/ingest ─────────────────────────────────────────── //

export const ingestModule1 = async (req: Request, res: Response) => {
  if (!verifyIngestKey(req, res)) return;

  const body = req.body as IngestPayload;
  if (!Array.isArray(body?.countries) || body.countries.length === 0) {
    return res.status(400).json({ error: 'payload.countries must be a non-empty array' });
  }

  const counts = { countries: 0, universities: 0, programs: 0 };

  try {
    for (const c of body.countries) {
      if (!c.code || !c.name) continue;

      const country = await prisma.country.upsert({
        where:  { code: c.code.toUpperCase() },
        create: { code: c.code.toUpperCase(), name: c.name },
        update: { name: c.name },
      });
      counts.countries++;

      for (const u of c.universities ?? []) {
        if (!u.name) continue;

        const university = await prisma.university.upsert({
          where:  { countryId_name: { countryId: country.id, name: u.name } },
          create: {
            name: u.name,
            countryId:   country.id,
            city:        u.city        ?? null,
            website:     u.website     ?? null,
            description: u.description ?? null,
            sourceUrl:   u.sourceUrl   ?? null,
          },
          update: {
            city:        u.city        ?? undefined,
            website:     u.website     ?? undefined,
            description: u.description ?? undefined,
            sourceUrl:   u.sourceUrl   ?? undefined,
          },
        });
        counts.universities++;

        for (const p of u.programs ?? []) {
          if (!p.title || !p.field || !p.level) continue;

          const level = normalizeLevel(p.level);
          if (!level) continue;

          const program = await prisma.program.upsert({
            where: {
              universityId_title_level: {
                universityId: university.id,
                title: p.title,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                level: level as any,
              },
            },
            create: {
              universityId:  university.id,
              title:         p.title,
              field:         p.field,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              level:         level as any,
              durationMonths: p.durationMonths ?? null,
              tuitionMinUSD:  p.tuitionMinUSD  ?? null,
              tuitionMaxUSD:  p.tuitionMaxUSD  ?? null,
              description:    p.description    ?? null,
              sourceUrl:      p.sourceUrl      ?? null,
            },
            update: {
              field:         p.field,
              durationMonths: p.durationMonths ?? undefined,
              tuitionMinUSD:  p.tuitionMinUSD  ?? undefined,
              tuitionMaxUSD:  p.tuitionMaxUSD  ?? undefined,
              description:    p.description    ?? undefined,
              sourceUrl:      p.sourceUrl      ?? undefined,
            },
          });
          counts.programs++;

          // Requirements — replace strategy
          if (p.requirements !== undefined) {
            await prisma.programRequirement.deleteMany({ where: { programId: program.id } });
            if (p.requirements.length > 0) {
              await prisma.programRequirement.createMany({
                data: p.requirements.map(r => ({
                  programId: program.id,
                  key:   r.key,
                  value: r.value,
                })),
              });
            }
          }

          // Deadlines — replace strategy
          if (p.deadlines !== undefined) {
            await prisma.programDeadline.deleteMany({ where: { programId: program.id } });
            const valid = p.deadlines
              .filter(d => d.term && d.deadline && d.deadline.toLowerCase() !== 'rolling')
              .flatMap(d => {
                const date = new Date(d.deadline);
                return isNaN(date.getTime())
                  ? []
                  : [{ programId: program.id, term: d.term, deadline: date }];
              });
            if (valid.length > 0) {
              await prisma.programDeadline.createMany({ data: valid });
            }
          }
        }
      }
    }

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
    const [countries, universities, programs, requirements, deadlines] = await Promise.all([
      prisma.country.count(),
      prisma.university.count(),
      prisma.program.count(),
      prisma.programRequirement.count(),
      prisma.programDeadline.count(),
    ]);
    res.status(200).json({ countries, universities, programs, requirements, deadlines });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', details: String(err) });
  }
};
