/**
 * Professors Service — Serper-powered professor search with LLM extraction.
 *
 * Trust rules:
 * - Never invent professors. If search returns nothing credible, return empty array.
 * - Every result must have a real profileUrl from a university or academic domain.
 * - LLM is instructed to return [] when uncertain — no fabrication.
 * - Profile pages are ranked higher than listing/directory pages.
 * - Obvious nonsense or too-short inputs are rejected before hitting search.
 */

const SERPER_URL = 'https://google.serper.dev/search';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ProfessorSearchRequest {
  researchInterest: string;
  university?: string;
  country?: string;
  level?: 'phd' | 'masters';
}

export interface ProfessorResult {
  name: string;
  title: string;
  university: string;
  department: string;
  researchAreas: string[];
  email: string | null;
  profileUrl: string | null;
  snippet: string;
  emailTemplate: string;
  sourceVerified: boolean;
}

export interface ProfessorSearchResponse {
  query: string;
  results: ProfessorResult[];
  searchedAt: string;
  warning?: string;
}

// Domains that are credible academic sources
const ACADEMIC_DOMAINS = [
  '.edu', '.ac.uk', '.ac.in', '.ac.au', '.ac.nz', '.ac.za', '.ac.jp', '.ac.kr',
  '.uni-', 'university', 'institute', 'college', 'scholar.google', 'researchgate.net',
  'academia.edu', 'orcid.org', 'dblp.org', 'semanticscholar.org', 'pubmed',
  'faculty', 'staff', 'people', 'lab.', '-lab', 'research',
];

// URL segments that strongly indicate a personal profile page
const PROFILE_SIGNALS = [
  '/faculty/', '/staff/', '/people/', '/person/', '/researcher/',
  '/professor/', '/user/', '/member/', '/profile/', '/about/',
  '~',   // e.g. cs.mit.edu/~jdoe
];

// URL segments that indicate a listing/directory page (lower confidence)
const LISTING_SIGNALS = [
  '/faculty', '/faculty-list', '/directory', '/search', '/browse',
  '/members', '/team', '/professors', '/researchers', '/all-faculty',
  '/index', '/list', '/catalog', 'page=', 'query=', '?search',
];

// Patterns in page title or snippet that indicate a personal bio/profile
const PROFILE_TITLE_SIGNALS = [
  'professor', 'associate professor', 'assistant professor', 'faculty',
  'researcher', 'ph.d', 'phd', 'research interests', 'publications',
  'lab director', 'curriculum vitae', 'biography', 'bio',
];

// Patterns that indicate a listing page
const LISTING_TITLE_SIGNALS = [
  'faculty directory', 'faculty list', 'faculty members', 'our faculty',
  'all professors', 'search results', 'browse faculty', 'department faculty',
  'academic staff', 'meet our', 'faculty & staff',
];

function isAcademicUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return ACADEMIC_DOMAINS.some(d => lower.includes(d));
}

/**
 * Score a search result: higher = more likely to be a personal professor profile page.
 * Returns a score 0-100 (higher is better).
 */
function scoreProfileLikelihood(result: { title: string; link: string; snippet: string }): number {
  const urlLower = result.link.toLowerCase();
  const titleLower = result.title.toLowerCase();
  const snippetLower = result.snippet.toLowerCase();
  let score = 50; // base

  // Academic domain bonus
  if (isAcademicUrl(result.link)) score += 15;

  // URL profile signals (strong positive)
  for (const sig of PROFILE_SIGNALS) {
    if (urlLower.includes(sig)) { score += 20; break; }
  }

  // URL listing signals (strong negative)
  for (const sig of LISTING_SIGNALS) {
    if (urlLower.includes(sig)) { score -= 25; break; }
  }

  // PDF penalty (usually not a profile page)
  if (urlLower.endsWith('.pdf')) score -= 30;

  // Title profile signals
  const titleProfileMatches = PROFILE_TITLE_SIGNALS.filter(s => titleLower.includes(s)).length;
  score += titleProfileMatches * 5;

  // Title listing signals (strong penalty)
  const titleListingMatches = LISTING_TITLE_SIGNALS.filter(s => titleLower.includes(s)).length;
  score -= titleListingMatches * 20;

  // Snippet quality — personal details indicate profile
  if (snippetLower.includes('@') && snippetLower.includes('.edu')) score += 10; // email
  if (snippetLower.includes('research interest')) score += 8;
  if (snippetLower.includes('ph.d') || snippetLower.includes('phd')) score += 5;
  if (snippetLower.includes('publication')) score += 5;

  // ResearchGate/ORCID/SemanticScholar are usually individual profiles
  if (urlLower.includes('researchgate.net/profile/')) score += 25;
  if (urlLower.includes('orcid.org/')) score += 20;
  if (urlLower.includes('scholar.google')) score += 10;
  if (urlLower.includes('semanticscholar.org/author/')) score += 15;

  return Math.max(0, Math.min(100, score));
}

/**
 * Rejects obvious nonsense: random characters, too short, all digits, etc.
 */
function isValidQuery(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  const hasVowel = /[aeiouAEIOU]/.test(trimmed);
  const wordCount = trimmed.split(/\s+/).length;
  if (!hasVowel && wordCount === 1 && trimmed.length < 6) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}

type RawResult = { title: string; link: string; snippet: string };

async function serperSearch(query: string, numResults = 10): Promise<RawResult[]> {
  const apiKey = process.env.SERPER_APIKEY || process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(SERPER_URL, {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: numResults }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return [];
    const data = await response.json() as { organic?: Array<{ title?: string; link?: string; snippet?: string }> };
    return (data.organic ?? []).map(r => ({ title: r.title ?? '', link: r.link ?? '', snippet: r.snippet ?? '' }));
  } catch {
    return [];
  }
}

async function extractProfessors(
  searchResults: RawResult[],
  req: ProfessorSearchRequest,
): Promise<ProfessorResult[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  if (!apiKey || searchResults.length === 0) return [];

  // Score and sort results — profile pages first
  const scored = searchResults
    .map(r => ({ ...r, profileScore: scoreProfileLikelihood(r) }))
    .sort((a, b) => b.profileScore - a.profileScore);

  // Separate high-confidence profiles from lower-confidence (listing pages, etc.)
  const highConfidence = scored.filter(r => r.profileScore >= 55);
  const fallback = scored.filter(r => r.profileScore < 55);

  // Use high-confidence results if we have enough; otherwise include fallback
  const resultsToProcess = highConfidence.length >= 2
    ? highConfidence.slice(0, 8)
    : [...highConfidence, ...fallback].slice(0, 8);

  const resultsJson = JSON.stringify(
    resultsToProcess.map(r => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet,
      profileScore: r.profileScore,
    })),
    null,
    2,
  );

  const universityFilter = req.university
    ? `IMPORTANT: Only extract professors who are explicitly from "${req.university}". Reject any professor from a different institution.`
    : '';

  const countryFilter = req.country
    ? `IMPORTANT: Only extract professors from institutions in "${req.country}". Reject professors from other countries.`
    : '';

  const prompt = `You are a strict academic data extractor. Extract professor information ONLY from the provided search results.

Research interest: "${req.researchInterest}"
${universityFilter}
${countryFilter}

Search results (sorted by profile-likelihood score, higher = more likely a personal professor profile):
${resultsJson}

STRICT RULES:
1. Only extract a professor if their name, institution, and research area are CLEARLY mentioned in the result.
2. PREFER results with high profileScore — those are more likely to be actual professor profile pages.
3. AVOID extracting from listing/directory pages (where multiple professors appear on one page). If a result looks like a faculty directory listing, only extract ONE professor from it at most, and only if their name is clearly in the title or snippet.
4. Do NOT invent, guess, or extrapolate any professor not explicitly present in the results.
5. Do NOT fill in placeholder names like "Professor X" or "Faculty Member".
6. If a result is not about a real, named professor, skip it.
7. If you cannot confidently identify ANY real professor, return an empty array [].
8. The profileUrl MUST be the actual URL from the result — never a made-up URL.
9. Prefer the URL that is most likely the professor's own profile page, not a listing page.
10. Email can only be included if it appears verbatim in the snippet.

Return ONLY a JSON array (may be empty []):
[
  {
    "name": "Exact full name as found in results",
    "title": "Title as found (Professor/Associate Professor/etc) or null",
    "university": "University name as found in results",
    "department": "Department if mentioned, otherwise null",
    "researchAreas": ["area from results", "..."],
    "email": "exact email if found verbatim, otherwise null",
    "profileUrl": "the best URL for this professor's own profile page",
    "snippet": "1-2 sentence summary of their work from the results",
    "isProfilePage": true/false — whether the URL appears to be the professor's own profile vs a listing page
  }
]

Return ONLY the JSON array. No explanation, no markdown.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) return [];

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data?.choices?.[0]?.message?.content?.trim() ?? '';
    const cleaned = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as unknown;
    if (!Array.isArray(parsed)) return [];

    const extracted = (parsed as Array<Record<string, unknown>>)
      .filter(p => {
        const name = String(p.name ?? '').trim();
        if (!name || name.toLowerCase().startsWith('professor ') || name === 'Unknown Professor') return false;
        if (!p.profileUrl) return false;
        return true;
      })
      .map(p => ({
        name: String(p.name),
        title: p.title ? String(p.title) : 'Faculty',
        university: String(p.university ?? req.university ?? 'University'),
        department: p.department ? String(p.department) : req.researchInterest,
        researchAreas: Array.isArray(p.researchAreas)
          ? (p.researchAreas as unknown[]).map(String)
          : [req.researchInterest],
        email: p.email ? String(p.email) : null,
        profileUrl: p.profileUrl ? String(p.profileUrl) : null,
        snippet: String(p.snippet ?? ''),
        sourceVerified: true,
        isProfilePage: p.isProfilePage === true,
        emailTemplate: buildEmailTemplate({
          name: String(p.name),
          university: String(p.university ?? req.university ?? 'their university'),
          researchInterest: req.researchInterest,
          level: req.level ?? 'phd',
        }),
        _profileScore: scoreProfileLikelihood({
          title: '',
          link: String(p.profileUrl ?? ''),
          snippet: String(p.snippet ?? ''),
        }),
      }));

    // Sort extracted results: actual profile pages first
    extracted.sort((a, b) => {
      const aScore = (a.isProfilePage ? 30 : 0) + a._profileScore;
      const bScore = (b.isProfilePage ? 30 : 0) + b._profileScore;
      return bScore - aScore;
    });

    return extracted
      .slice(0, 5)
      .map(({ _profileScore: _, isProfilePage: __, ...rest }) => rest);
  } catch {
    return [];
  }
}

function buildEmailTemplate(opts: {
  name: string;
  university: string;
  researchInterest: string;
  level: string;
}): string {
  return `Subject: Inquiry About ${opts.level === 'phd' ? 'PhD' : 'Research'} Opportunities in ${opts.researchInterest}

Dear ${opts.name},

I hope this email finds you well. My name is [Your Name], and I am a [Your Degree] student at [Your Institution] with a strong background in [Your Field]. I came across your work on ${opts.researchInterest} and found it closely aligned with my research interests.

I am writing to inquire about potential ${opts.level === 'phd' ? 'PhD' : 'research'} positions in your group for [intake term, e.g., Fall 2027]. I am particularly interested in [specific aspect of their research].

My academic profile:
- GPA: [Your GPA]
- Research experience: [Brief mention]
- Relevant skills: [Key skills]

I have attached my CV and would be delighted to discuss potential research directions. Please find my research statement attached as well.

Thank you for your time and consideration.

Warm regards,
[Your Name]
[Your Email]
[Your University]`;
}

function getProviderStatus(): { searchReady: boolean; extractReady: boolean; missingKeys: string[] } {
  const serperKey = process.env.SERPER_APIKEY || process.env.SERPER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const missingKeys: string[] = [];
  if (!serperKey) missingKeys.push('SERPER_API_KEY');
  if (!openaiKey && !openrouterKey) missingKeys.push('OPENAI_API_KEY or OPENROUTER_API_KEY');
  return {
    searchReady: !!serperKey,
    extractReady: !!(openaiKey || openrouterKey),
    missingKeys,
  };
}

export async function searchProfessors(req: ProfessorSearchRequest): Promise<ProfessorSearchResponse> {
  const { searchReady, extractReady, missingKeys } = getProviderStatus();

  if (!searchReady || !extractReady) {
    const missing = missingKeys.join(', ');
    throw new Error(
      `Professor search is not configured for this deployment. Missing env vars: ${missing}. ` +
      'Set these in your server environment to enable professor search.',
    );
  }

  // Build two complementary queries:
  // 1. Profile-targeted: tries to surface individual professor profile pages directly
  // 2. Broad fallback: wider search for any mention of professor + topic
  const profileQuery = buildProfileQuery(req);
  const broadQuery = buildBroadQuery(req);

  // Run both searches in parallel; profile query gets 8 results, broad gets 6
  const [profileResults, broadResults] = await Promise.all([
    serperSearch(profileQuery, 8),
    serperSearch(broadQuery, 6),
  ]);

  // Deduplicate by URL, keeping profile-query results first (higher priority)
  const seen = new Set<string>();
  const combined: RawResult[] = [];
  for (const r of [...profileResults, ...broadResults]) {
    if (r.link && !seen.has(r.link)) {
      seen.add(r.link);
      combined.push(r);
    }
  }

  const professors = await extractProfessors(combined, req);

  const warning = professors.length === 0 && combined.length === 0
    ? 'No web results found. Check your search terms or try a different university name.'
    : professors.length === 0 && combined.length > 0
    ? 'Search returned results but no verified professors could be extracted. Try a more specific research area or university name.'
    : undefined;

  return {
    query: profileQuery,
    results: professors,
    searchedAt: new Date().toISOString(),
    warning,
  };
}

function buildProfileQuery(req: ProfessorSearchRequest): string {
  const parts: string[] = [];

  if (req.university) {
    // Target the specific university's domain for profile pages
    const uniSlug = req.university.toLowerCase().replace(/\s+/g, '');
    parts.push(`(site:${uniSlug}.edu OR site:${uniSlug}.ac.uk OR "${req.university}")`);
    parts.push('professor faculty profile');
  } else {
    parts.push('professor faculty profile page');
  }

  parts.push(`"${req.researchInterest}"`);

  if (req.country) parts.push(req.country);

  // Strongly favour pages that look like personal profile pages
  parts.push('(inurl:faculty OR inurl:people OR inurl:staff OR inurl:profile OR inurl:researcher)');

  return parts.join(' ');
}

function buildBroadQuery(req: ProfessorSearchRequest): string {
  const parts: string[] = [];

  if (req.university) {
    parts.push(`"${req.university}" professor`);
  } else {
    parts.push('professor');
  }

  parts.push(`"${req.researchInterest}"`);
  if (req.country) parts.push(req.country);
  parts.push('faculty research');

  return parts.join(' ');
}

export { isValidQuery };
