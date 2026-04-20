/**
 * Professors Service — Serper-powered professor search with LLM extraction.
 * Uses the same Serper client as SearchService.
 */

const SERPER_URL = 'https://google.serper.dev/search';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'; // fallback

export interface ProfessorSearchRequest {
  researchInterest: string;
  university?: string;
  country?: string;
  level?: 'phd' | 'masters'; // used to frame email template
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
}

export interface ProfessorSearchResponse {
  query: string;
  results: ProfessorResult[];
  searchedAt: string;
}

async function serperSearch(query: string): Promise<Array<{ title: string; link: string; snippet: string }>> {
  const apiKey = process.env.SERPER_APIKEY || process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(SERPER_URL, {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 8 }),
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

  if (!apiKey || searchResults.length === 0) {
    // Return stub results based on search snippets
    return searchResults.slice(0, 5).map((r, i) => ({
      name: r.title.split(' - ')[0].split('|')[0].trim() || `Professor ${i + 1}`,
      title: 'Faculty Member',
      university: req.university ?? 'University',
      department: req.researchInterest,
      researchAreas: [req.researchInterest],
      email: null,
      profileUrl: r.link || null,
      snippet: r.snippet,
      emailTemplate: buildEmailTemplate({
        name: r.title.split(' - ')[0].trim(),
        university: req.university ?? 'your university',
        researchInterest: req.researchInterest,
        level: req.level ?? 'phd',
      }),
    }));
  }

  const resultsJson = JSON.stringify(
    searchResults.slice(0, 8).map(r => ({ title: r.title, url: r.link, snippet: r.snippet })),
    null,
    2,
  );

  const prompt = `You are extracting professor information from search results.

Research interest: "${req.researchInterest}"
${req.university ? `University filter: ${req.university}` : ''}
${req.country ? `Country filter: ${req.country}` : ''}

Search results:
${resultsJson}

Extract up to 5 professors from these results. For each professor return ONLY a JSON array:
[
  {
    "name": "Prof. Full Name",
    "title": "Associate Professor / Professor / etc",
    "university": "University name",
    "department": "Department name",
    "researchAreas": ["area1", "area2"],
    "email": "email@uni.edu or null",
    "profileUrl": "https://... or null",
    "snippet": "brief description of their work"
  }
]

If you cannot extract a professor from a result, skip it. Return ONLY the JSON array.`;

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
        temperature: 0.2,
        max_tokens: 1000,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) throw new Error('LLM failed');

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data?.choices?.[0]?.message?.content?.trim() ?? '';

    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) throw new Error('Not an array');

    return (parsed as Array<Record<string, unknown>>).slice(0, 5).map(p => ({
      name: String(p.name ?? 'Unknown Professor'),
      title: String(p.title ?? 'Faculty'),
      university: String(p.university ?? req.university ?? 'University'),
      department: String(p.department ?? req.researchInterest),
      researchAreas: Array.isArray(p.researchAreas)
        ? (p.researchAreas as unknown[]).map(String)
        : [req.researchInterest],
      email: p.email ? String(p.email) : null,
      profileUrl: p.profileUrl ? String(p.profileUrl) : null,
      snippet: String(p.snippet ?? ''),
      emailTemplate: buildEmailTemplate({
        name: String(p.name ?? 'Professor'),
        university: String(p.university ?? req.university ?? 'your university'),
        researchInterest: req.researchInterest,
        level: req.level ?? 'phd',
      }),
    }));
  } catch {
    // Fallback: extract basic info from snippets
    return searchResults.slice(0, 5).map((r) => ({
      name: r.title.split(' - ')[0].split('|')[0].trim(),
      title: 'Faculty Member',
      university: req.university ?? 'University',
      department: req.researchInterest,
      researchAreas: [req.researchInterest],
      email: null,
      profileUrl: r.link || null,
      snippet: r.snippet,
      emailTemplate: buildEmailTemplate({
        name: r.title.split(' - ')[0].trim(),
        university: req.university ?? 'their university',
        researchInterest: req.researchInterest,
        level: req.level ?? 'phd',
      }),
    }));
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

export async function searchProfessors(req: ProfessorSearchRequest): Promise<ProfessorSearchResponse> {
  const queryParts = [req.researchInterest, 'professor'];
  if (req.university) queryParts.push(req.university);
  if (req.country) queryParts.push(req.country);
  queryParts.push('faculty research');

  const query = queryParts.join(' ');
  const rawResults = await serperSearch(query);
  const professors = await extractProfessors(rawResults, req);

  return {
    query,
    results: professors,
    searchedAt: new Date().toISOString(),
  };
}
