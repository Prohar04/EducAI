/**
 * Professors Service — Serper-powered professor search with LLM extraction.
 *
 * Trust rules:
 * - Never invent professors. If search returns nothing credible, return empty array.
 * - Every result must have a real profileUrl from a university or academic domain.
 * - LLM is instructed to return [] when uncertain — no fabrication.
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

function isAcademicUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return ACADEMIC_DOMAINS.some(d => lower.includes(d));
}

/**
 * Rejects obvious nonsense: random characters, too short, all digits, etc.
 */
function isValidQuery(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  // Reject strings that are >80% random chars (no vowels, no spaces)
  const hasVowel = /[aeiouAEIOU]/.test(trimmed);
  const hasSpace = /\s/.test(trimmed);
  const wordCount = trimmed.split(/\s+/).length;
  // Single word with no vowels and short = likely nonsense
  if (!hasVowel && wordCount === 1 && trimmed.length < 6) return false;
  // Pure numbers
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}

async function serperSearch(query: string): Promise<Array<{ title: string; link: string; snippet: string }>> {
  const apiKey = process.env.SERPER_APIKEY || process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(SERPER_URL, {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 10 }),
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
  searchResults: Array<{ title: string; link: string; snippet: string }>,
  req: ProfessorSearchRequest,
): Promise<ProfessorResult[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  // Without AI key or search results, we cannot safely extract — return empty
  if (!apiKey || searchResults.length === 0) {
    return [];
  }

  // Only pass results that look like academic pages to reduce hallucination
  const academicResults = searchResults.filter(r => isAcademicUrl(r.link));
  const resultsToProcess = academicResults.length >= 2 ? academicResults : searchResults;

  const resultsJson = JSON.stringify(
    resultsToProcess.slice(0, 8).map(r => ({ title: r.title, url: r.link, snippet: r.snippet })),
    null,
    2,
  );

  const universityFilter = req.university
    ? `IMPORTANT: Only extract professors who are explicitly from "${req.university}". Reject any professor from a different institution.`
    : '';

  const countryFilter = req.country
    ? `IMPORTANT: Only extract professors from institutions in "${req.country}". Reject professors from other countries.`
    : '';

  const prompt = `You are a strict academic data extractor. Extract professor information ONLY from the provided search result snippets.

Research interest: "${req.researchInterest}"
${universityFilter}
${countryFilter}

Search results:
${resultsJson}

STRICT RULES:
1. Only extract a professor if their name, institution, and research area are CLEARLY mentioned in the search result text or URL.
2. Do NOT invent, guess, or extrapolate any professor who is not explicitly present in the results.
3. Do NOT fill in placeholder names like "Professor X" or "Faculty Member".
4. If a result is not about a real professor, skip it completely.
5. If you cannot confidently identify ANY real professor from these results, return an empty array [].
6. The profileUrl MUST be the actual URL from the search result (not a made-up URL).
7. Email can only be included if it appears verbatim in the snippet.

Return ONLY a JSON array (may be empty []):
[
  {
    "name": "Exact name as found in results",
    "title": "Title as found (Professor/Associate Professor/etc) or null",
    "university": "University name as found in results",
    "department": "Department if mentioned, otherwise null",
    "researchAreas": ["area from results", "..."],
    "email": "exact email if found verbatim, otherwise null",
    "profileUrl": "exact URL from results",
    "snippet": "1-2 sentence summary of their work from the results"
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
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) return [];

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data?.choices?.[0]?.message?.content?.trim() ?? '';

    // Strip markdown code blocks if present
    const cleaned = content.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as unknown;
    if (!Array.isArray(parsed)) return [];

    return (parsed as Array<Record<string, unknown>>)
      .filter(p => {
        // Require a real name (not empty, not "Unknown", not "Professor N")
        const name = String(p.name ?? '').trim();
        if (!name || name.toLowerCase().startsWith('professor ') || name === 'Unknown Professor') return false;
        // Require a profileUrl
        if (!p.profileUrl) return false;
        return true;
      })
      .slice(0, 5)
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
        emailTemplate: buildEmailTemplate({
          name: String(p.name),
          university: String(p.university ?? req.university ?? 'their university'),
          researchInterest: req.researchInterest,
          level: req.level ?? 'phd',
        }),
      }));
  } catch {
    // On any error (parse failure, network, etc.) — return empty rather than inventing data
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

  const queryParts: string[] = [];

  if (req.university) {
    queryParts.push(`site:${req.university.toLowerCase().replace(/\s+/g, '')}.edu OR "${req.university}" professor`);
  } else {
    queryParts.push('professor');
  }

  queryParts.push(`"${req.researchInterest}"`);
  if (req.country) queryParts.push(req.country);
  queryParts.push('faculty research lab');

  const query = queryParts.join(' ');
  const rawResults = await serperSearch(query);
  const professors = await extractProfessors(rawResults, req);

  const warning = professors.length === 0 && rawResults.length === 0
    ? 'No web results found. Check your search terms or try a different university name.'
    : professors.length === 0 && rawResults.length > 0
    ? 'Search returned results but no verified professors could be extracted. Try a more specific research area or university name.'
    : undefined;

  return {
    query,
    results: professors,
    searchedAt: new Date().toISOString(),
    warning,
  };
}

export { isValidQuery };
