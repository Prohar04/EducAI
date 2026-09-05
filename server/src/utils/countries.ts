/**
 * Lightweight country-name ⇄ ISO 3166-1 alpha-2 resolver.
 *
 * Used by the scholarship search so that a free-text query like "germany",
 * "USA" or "united kingdom" is treated as a country filter rather than a
 * literal title match.
 */

// ISO code → canonical display name (codes present in the bundled data files
// plus a few common study-abroad destinations).
export const COUNTRY_NAMES: Record<string, string> = {
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
  NZ: 'New Zealand',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  SE: 'Sweden',
  SG: 'Singapore',
  SI: 'Slovenia',
  SK: 'Slovakia',
  US: 'United States',
};

// Lower-cased alias → ISO code. Built from the canonical names plus common
// alternates and abbreviations.
const ALIASES: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(COUNTRY_NAMES).map(([code, name]) => [name.toLowerCase(), code]),
  ),
  usa: 'US',
  'u.s.': 'US',
  'u.s.a.': 'US',
  america: 'US',
  'united states of america': 'US',
  uk: 'GB',
  'u.k.': 'GB',
  britain: 'GB',
  'great britain': 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  holland: 'NL',
  'the netherlands': 'NL',
  deutschland: 'DE',
  nippon: 'JP',
  'south korea': 'KR',
  korea: 'KR',
  aussie: 'AU',
  'new-zealand': 'NZ',
  nz: 'NZ',
  'czech republic': 'CZ',
};

/**
 * Resolve a raw value — which may be an ISO code ("DE"), a country name
 * ("Germany") or a common alias ("USA") — to an uppercase ISO alpha-2 code.
 * Returns `null` when the value does not look like a country.
 */
export function resolveCountryCode(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  // Already an ISO alpha-2 code we recognise.
  const upper = value.toUpperCase();
  if (upper.length === 2 && COUNTRY_NAMES[upper]) return upper;

  const alias = ALIASES[value.toLowerCase()];
  return alias ?? null;
}

/** Human-readable country name for an ISO code, falling back to the code. */
export function countryName(code?: string | null): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}
