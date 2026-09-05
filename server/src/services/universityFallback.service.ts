import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Static fallback dataset for the university search.
 *
 * When the primary (database) search throws or returns zero rows, the
 * controller falls back to the bundled JSON files in `server/src/data`
 * (including the per-country files under `server/src/data/europe`).
 */

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

// ISO 3166-1 alpha-2 → display name, for the codes present in the data files.
const COUNTRY_NAMES: Record<string, string> = {
  AT: 'Austria',
  AU: 'Australia',
  BE: 'Belgium',
  BG: 'Bulgaria',
  CA: 'Canada',
  CH: 'Switzerland',
  CN: 'China',
  CY: 'Cyprus',
  CZ: 'Czechia',
  DE: 'Germany',
  DK: 'Denmark',
  EE: 'Estonia',
  ES: 'Spain',
  FI: 'Finland',
  FR: 'France',
  GB: 'United Kingdom',
  GR: 'Greece',
  HR: 'Croatia',
  HU: 'Hungary',
  IE: 'Ireland',
  IT: 'Italy',
  JP: 'Japan',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  LV: 'Latvia',
  NL: 'Netherlands',
  NO: 'Norway',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  SE: 'Sweden',
  SI: 'Slovenia',
  SK: 'Slovakia',
  US: 'United States',
};

interface RawUniversity {
  name?: string;
  countryCode?: string;
  city?: string;
  website?: string;
  description?: string;
  sourceUrl?: string;
  ranking?: string;
  universityType?: string;
  admissionsUrl?: string;
  tuitionUrl?: string;
  scholarshipsUrl?: string;
  internationalUrl?: string;
  applicationPortalUrl?: string;
}

export interface FallbackUniversity {
  id: string;
  name: string;
  countryId: string;
  city: string | null;
  website: string | null;
  description: string | null;
  sourceUrl: string | null;
  ranking: string | null;
  universityType: string | null;
  admissionsUrl: string | null;
  tuitionUrl: string | null;
  scholarshipsUrl: string | null;
  internationalUrl: string | null;
  applicationPortalUrl: string | null;
  lastVerifiedAt: null;
  createdAt: null;
  updatedAt: null;
  country: { id: string; code: string; name: string };
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toNullable = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

function collectJsonFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(full);
  }
  return files;
}

function normalize(raw: RawUniversity): FallbackUniversity | null {
  const name = raw.name?.trim();
  const code = raw.countryCode?.trim().toUpperCase();
  if (!name || !code) return null;

  const countryId = `fallback-country:${code}`;
  return {
    id: `fallback:${code}:${slugify(name)}`,
    name,
    countryId,
    city: toNullable(raw.city),
    website: toNullable(raw.website),
    description: toNullable(raw.description),
    sourceUrl: toNullable(raw.sourceUrl),
    ranking: toNullable(raw.ranking),
    universityType: toNullable(raw.universityType),
    admissionsUrl: toNullable(raw.admissionsUrl),
    tuitionUrl: toNullable(raw.tuitionUrl),
    scholarshipsUrl: toNullable(raw.scholarshipsUrl),
    internationalUrl: toNullable(raw.internationalUrl),
    applicationPortalUrl: toNullable(raw.applicationPortalUrl),
    lastVerifiedAt: null,
    createdAt: null,
    updatedAt: null,
    country: { id: countryId, code, name: COUNTRY_NAMES[code] ?? code },
  };
}

let cache: FallbackUniversity[] | null = null;

/** Load, normalize and de-duplicate every bundled university record (cached). */
export function loadFallbackUniversities(): FallbackUniversity[] {
  if (cache) return cache;

  const seen = new Map<string, FallbackUniversity>();
  let files: string[] = [];
  try {
    files = collectJsonFiles(DATA_DIR);
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

    for (const row of parsed as RawUniversity[]) {
      const uni = normalize(row);
      if (!uni) continue;
      const key = `${uni.country.code}:${uni.name.toLowerCase()}`;
      if (!seen.has(key)) seen.set(key, uni);
    }
  }

  cache = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

/** Mirror of the DB search: filter by country code / name, then paginate. */
export function searchFallbackUniversities(params: {
  country?: string;
  q?: string;
  skip: number;
  take: number;
}): { items: FallbackUniversity[]; total: number } {
  const { country, q, skip, take } = params;
  const code = country?.toUpperCase();
  const needle = q?.trim().toLowerCase();

  const filtered = loadFallbackUniversities().filter((uni) => {
    if (code && uni.country.code !== code) return false;
    if (needle && !uni.name.toLowerCase().includes(needle)) return false;
    return true;
  });

  return { items: filtered.slice(skip, skip + take), total: filtered.length };
}
