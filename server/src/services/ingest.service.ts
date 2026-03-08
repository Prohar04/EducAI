/**
 * Ingest service — pure upsert logic extracted from the HTTP controller so
 * the match background worker can call it directly without an HTTP round-trip
 * or X-INGEST-KEY header.
 */
import prisma from '#src/config/database.ts';
import { Prisma } from '../generated/client.ts';

// ── Canonical input types ──────────────────────────────────────────────────── //

export interface RequirementInput { key: string; value: string; }
export interface DeadlineInput    { term: string; deadline: string; }

export interface ProgramInput {
  title:          string;
  field:          string;
  level:          string;
  durationMonths?: number | null;
  tuitionMinUSD?:  number | null;
  tuitionMaxUSD?:  number | null;
  description?:    string | null;
  sourceUrl?:      string | null;
  requirements?:   RequirementInput[];
  deadlines?:      DeadlineInput[];
}

export interface UniversityInput {
  name:         string;
  city?:        string | null;
  website?:     string | null;
  description?: string | null;
  sourceUrl?:   string | null;
  programs?:    ProgramInput[];
}

export interface CountryInput {
  code:           string;
  name:           string;
  universities?:  UniversityInput[];
}

export interface IngestCounts {
  countries:    number;
  universities: number;
  programs:     number;
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

export function normalizeLevel(raw: string): string | null {
  return LEVEL_MAP[raw.toUpperCase().replace(/[^A-Z]/g, '')] ?? null;
}

// ── Core upsert ───────────────────────────────────────────────────────────── //

/**
 * Upsert countries → universities → programs in batches.
 * Safe to call from within a background worker — no HTTP required.
 */
export async function performIngest(
  countries: CountryInput[],
  _runId?: string,
): Promise<IngestCounts> {
  const counts: IngestCounts = { countries: 0, universities: 0, programs: 0 };

  for (const c of countries) {
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
          name:        u.name,
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

      // Process programs in batches of 50
      const batchSize = 50;
      const programList = u.programs ?? [];
      for (let i = 0; i < programList.length; i += batchSize) {
        const batch = programList.slice(i, i + batchSize);
        for (const p of batch) {
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
              universityId:   university.id,
              title:          p.title,
              field:          p.field,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              level:          level as any,
              durationMonths: p.durationMonths ?? null,
              tuitionMinUSD:  p.tuitionMinUSD  ?? null,
              tuitionMaxUSD:  p.tuitionMaxUSD  ?? null,
              description:    p.description    ?? null,
              sourceUrl:      p.sourceUrl      ?? null,
            },
            update: {
              field:          p.field,
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
  }

  return counts;
}
