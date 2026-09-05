import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Static fallback dataset for the scholarship search.
 *
 * When the primary (database) search throws or returns zero rows, the
 * controller falls back to the bundled JSON files in `server/src/data`
 * whose names start with `scholarships` — `scholarships_us.json`,
 * `scholarships_canada.json`, ... at the top level and
 * `europe/scholarships_<cc>.json` for the per-country European files.
 *
 * The shape of each record mirrors the `Scholarship` Prisma model plus a
 * nested `deadlines` array (`{ term, deadline }`).
 */

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

type ProgramLevel = 'BSC' | 'MSC' | 'PHD';

interface RawScholarshipDeadline {
  term?: string | null;
  deadline?: string | null;
}

interface RawScholarship {
  title?: string;
  provider?: string | null;
  countryCode?: string | null;
  level?: ProgramLevel | null;
  field?: string | null;
  url?: string | null;
  description?: string | null;
  amount?: string | null;
  fundingType?: string | null;
  minGpa?: number | null;
  requiresEnglishTest?: boolean;
  financialNeedRequired?: boolean;
  eligibleNationalities?: string[] | null;
  tags?: string[] | null;
  sourceUrl?: string | null;
  lastVerified?: string | null;
  isActive?: boolean;
  deadlines?: RawScholarshipDeadline[];
}

export interface FallbackScholarshipDeadline {
  id: string;
  scholarshipId: string;
  term: string | null;
  deadline: string; // ISO date string
  createdAt: null;
}

export interface FallbackScholarship {
  id: string;
  title: string;
  provider: string | null;
  countryCode: string | null;
  level: ProgramLevel | null;
  field: string | null;
  url: string | null;
  description: string | null;
  amount: string | null;
  fundingType: string | null;
  minGpa: number | null;
  requiresEnglishTest: boolean;
  financialNeedRequired: boolean;
  eligibleNationalities: string[] | null;
  tags: string[] | null;
  sourceUrl: string | null;
  lastVerified: string | null;
  isActive: boolean;
  createdAt: null;
  updatedAt: null;
  deadlines: FallbackScholarshipDeadline[];
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toNullable = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** Recursively collect every bundled `scholarships*.json` file. */
function collectScholarshipFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectScholarshipFiles(full));
    } else if (
      entry.isFile() &&
      entry.name.startsWith('scholarships') &&
      entry.name.endsWith('.json')
    ) {
      files.push(full);
    }
  }
  return files;
}

function normalize(raw: RawScholarship): FallbackScholarship | null {
  const title = raw.title?.trim();
  if (!title) return null;

  const code = raw.countryCode?.trim().toUpperCase() ?? null;
  const id = `fallback-scholarship:${code ?? 'GLOBAL'}:${slugify(title)}`;

  const deadlines: FallbackScholarshipDeadline[] = (raw.deadlines ?? [])
    .map((d) => {
      const raw = d.deadline?.trim();
      if (!raw) return null;
      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) return null;
      return {
        id: `${id}:deadline:${parsed.toISOString().slice(0, 10)}`,
        scholarshipId: id,
        term: toNullable(d.term),
        deadline: parsed.toISOString(),
        createdAt: null,
      } satisfies FallbackScholarshipDeadline;
    })
    .filter((d): d is FallbackScholarshipDeadline => d !== null)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  return {
    id,
    title,
    provider: toNullable(raw.provider),
    countryCode: code,
    level: raw.level ?? null,
    field: toNullable(raw.field),
    url: toNullable(raw.url),
    description: toNullable(raw.description),
    amount: toNullable(raw.amount),
    fundingType: toNullable(raw.fundingType),
    minGpa: typeof raw.minGpa === 'number' ? raw.minGpa : null,
    requiresEnglishTest: raw.requiresEnglishTest ?? false,
    financialNeedRequired: raw.financialNeedRequired ?? false,
    eligibleNationalities: Array.isArray(raw.eligibleNationalities)
      ? raw.eligibleNationalities
      : null,
    tags: Array.isArray(raw.tags) ? raw.tags : null,
    sourceUrl: toNullable(raw.sourceUrl),
    lastVerified: toNullable(raw.lastVerified),
    isActive: raw.isActive ?? true,
    createdAt: null,
    updatedAt: null,
    deadlines,
  };
}

let cache: FallbackScholarship[] | null = null;

/** Load, normalize and de-duplicate every bundled scholarship record (cached). */
export function loadFallbackScholarships(): FallbackScholarship[] {
  if (cache) return cache;

  const seen = new Map<string, FallbackScholarship>();
  let files: string[] = [];
  try {
    files = collectScholarshipFiles(DATA_DIR);
  } catch {
    files = [];
  }

  for (const file of files) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      continue;
    }
    if (!Array.isArray(parsed)) continue;

    for (const row of parsed as RawScholarship[]) {
      const scholarship = normalize(row);
      if (!scholarship) continue;
      if (!seen.has(scholarship.id)) seen.set(scholarship.id, scholarship);
    }
  }

  cache = [...seen.values()].sort((a, b) => a.title.localeCompare(b.title));
  return cache;
}

export interface FallbackScholarshipSearchParams {
  q?: string;
  countryCode?: string;
  level?: string;
  field?: string;
  fundingType?: string;
  financialNeed?: boolean;
  skip: number;
  take: number;
}

/** Mirror of the DB search: filter, drop fully-expired entries, then paginate. */
export function searchFallbackScholarships(params: FallbackScholarshipSearchParams): {
  items: FallbackScholarship[];
  total: number;
} {
  const { q, countryCode, level, field, fundingType, financialNeed, skip, take } = params;
  const code = countryCode?.trim().toUpperCase();
  const lvl = level?.trim().toUpperCase();
  const fundType = fundingType?.trim().toLowerCase();
  const needle = q?.trim().toLowerCase();
  const fieldNeedle = field?.trim().toLowerCase();
  const now = Date.now();

  const filtered = loadFallbackScholarships().filter((s) => {
    if (!s.isActive) return false;

    // Exclude scholarships whose every deadline is in the past.
    if (s.deadlines.length > 0) {
      const hasUpcoming = s.deadlines.some((d) => new Date(d.deadline).getTime() >= now);
      if (!hasUpcoming) return false;
    }

    // A country filter also matches global (null-country) scholarships.
    if (code && s.countryCode !== code && s.countryCode !== null) return false;
    if (lvl && s.level !== lvl) return false;
    if (fundType && (s.fundingType ?? '').toLowerCase() !== fundType) return false;
    if (financialNeed === true && !s.financialNeedRequired) return false;
    if (fieldNeedle && !(s.field ?? '').toLowerCase().includes(fieldNeedle)) return false;

    if (needle) {
      const haystack = [s.title, s.provider, s.description, s.field]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });

  return { items: filtered.slice(skip, skip + take), total: filtered.length };
}
