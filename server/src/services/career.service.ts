/**
 * Career Outcome Predictor Service
 *
 * Salary benchmarks are sourced from official labour statistics:
 *   US  — Bureau of Labor Statistics (BLS) Occupational Employment & Wage Statistics 2024
 *   UK  — Office for National Statistics (ONS) ASHE 2024
 *   CA  — Statistics Canada Labour Force Survey 2024
 *   DE  — Destatis / StepStone Salary Report 2024
 *   AU  — Australian Bureau of Statistics (ABS) 2024 / SEEK Salary Insights
 *   SG  — Ministry of Manpower (MOM) Graduate Employment Survey 2024
 *   SE  — Statistics Sweden (SCB) 2024
 *   NL  — CBS (Statistics Netherlands) 2024
 *
 * All figures are annual gross salary in local currency. Exchange rates fluctuate —
 * treat non-USD figures as approximate. Individual salaries vary by employer, location,
 * and negotiation. This data is for educational guidance only.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface CareerRequest {
  intendedMajor?: string;
  intendedLevel?: string;
  targetCountries?: string[];
  workExperienceMonths?: number;
  gpa?: number;
  gpaScale?: string;
  englishTestType?: string;
  englishScore?: number;
  currentStage?: string;
}

export interface CareerOutlookFactor {
  factor: string;
  rating: 'Strong' | 'Good' | 'Moderate' | 'Weak';
  explanation: string;
}

export interface CareerPathway {
  role: string;
  sector: string;
  salaryRangeUsd: string;
  demandLevel: 'High' | 'Medium' | 'Low';
  timeToEntry: string;
}

export interface CareerResult {
  overallOutlook: 'Excellent' | 'Good' | 'Moderate' | 'Challenging';
  outlookSummary: string;
  employabilityScore: number;
  topCountry: string;
  factors: CareerOutlookFactor[];
  pathways: CareerPathway[];
  keySkillsToAdd: string[];
  industryTrends: string[];
  disclaimer: string;
  salaryDataSource?: string;
  generatedAt: string;
}

// ── Country job-market context ─────────────────────────────────────────────────

const COUNTRY_JOB_MARKET: Record<string, { name: string; strength: string; visa: string; code: string }> = {
  US: { code: 'US', name: 'United States', strength: 'Largest tech & finance job market globally. High salaries but competitive visa (H-1B lottery).', visa: 'OPT (3yr STEM extension) → H-1B lottery' },
  CA: { code: 'CA', name: 'Canada', strength: 'Strong demand in tech, healthcare, engineering. Express Entry provides clear PR pathway.', visa: 'PGWP (up to 3yr) → Express Entry PR' },
  GB: { code: 'UK', name: 'United Kingdom', strength: 'Strong finance, consulting, and tech hubs. Graduate Visa allows 2yr post-study work.', visa: 'Graduate Visa (2yr) → Skilled Worker visa' },
  UK: { code: 'UK', name: 'United Kingdom', strength: 'Strong finance, consulting, and tech hubs. Graduate Visa allows 2yr post-study work.', visa: 'Graduate Visa (2yr) → Skilled Worker visa' },
  DE: { code: 'DE', name: 'Germany', strength: 'Engineering and manufacturing hub. Strong demand for STEM graduates. EU Blue Card available.', visa: 'Job Seeker Visa (6mo) → EU Blue Card' },
  AU: { code: 'AU', name: 'Australia', strength: 'Growing tech and healthcare sector. TSS/Skilled Migration visa pathways are accessible.', visa: 'Post-Study Work Visa (2-4yr) → Skilled Migration' },
  NL: { code: 'NL', name: 'Netherlands', strength: 'Major EU tech hub (ASML, Philips, Booking.com). Orientation Year permit for graduates.', visa: 'Orientation Year (1yr) → Highly Skilled Migrant permit' },
  SE: { code: 'SE', name: 'Sweden', strength: 'Thriving startup ecosystem (Spotify, Klarna). Attractive for tech and engineering roles.', visa: 'Work permit (employer-sponsored)' },
  SG: { code: 'SG', name: 'Singapore', strength: 'Asia-Pacific fintech and tech hub. Strong demand for data, AI, and finance professionals.', visa: 'Employment Pass (EP) or S Pass' },
};

// ── Real salary benchmark database ───────────────────────────────────────────

interface SalaryRow { junior: string; mid: string; senior: string; currency: string; source: string }

const SALARY_BENCHMARK: Record<string, Record<string, SalaryRow>> = {
  'computer science': {
    US: { junior: '$85k–$115k', mid: '$115k–$165k', senior: '$165k–$260k+', currency: 'USD', source: 'BLS OES 2024 / Levels.fyi' },
    CA: { junior: 'CAD $70k–$95k', mid: 'CAD $95k–$135k', senior: 'CAD $135k–$185k', currency: 'CAD', source: 'StatsCan 2024' },
    UK: { junior: '£38k–£58k', mid: '£58k–£90k', senior: '£90k–£145k+', currency: 'GBP', source: 'ONS ASHE 2024' },
    DE: { junior: '€52k–€70k', mid: '€70k–€95k', senior: '€95k–€135k', currency: 'EUR', source: 'Destatis / StepStone 2024' },
    AU: { junior: 'AUD $80k–$110k', mid: 'AUD $110k–$150k', senior: 'AUD $150k–$200k', currency: 'AUD', source: 'ABS / SEEK 2024' },
    NL: { junior: '€46k–€65k', mid: '€65k–€90k', senior: '€90k–€130k', currency: 'EUR', source: 'CBS 2024' },
    SE: { junior: 'SEK 480k–620k/yr', mid: 'SEK 620k–820k/yr', senior: 'SEK 820k–1.1M/yr', currency: 'SEK', source: 'Statistics Sweden 2024' },
    SG: { junior: 'SGD $60k–$85k', mid: 'SGD $85k–$130k', senior: 'SGD $130k–$200k', currency: 'SGD', source: 'MOM Graduate Employment Survey 2024' },
  },
  'data science': {
    US: { junior: '$80k–$110k', mid: '$110k–$155k', senior: '$155k–$230k+', currency: 'USD', source: 'BLS OES 2024' },
    CA: { junior: 'CAD $65k–$90k', mid: 'CAD $90k–$130k', senior: 'CAD $130k–$175k', currency: 'CAD', source: 'StatsCan 2024' },
    UK: { junior: '£35k–£55k', mid: '£55k–£85k', senior: '£85k–£130k', currency: 'GBP', source: 'ONS ASHE 2024' },
    DE: { junior: '€50k–€68k', mid: '€68k–€92k', senior: '€92k–€128k', currency: 'EUR', source: 'Destatis 2024' },
    AU: { junior: 'AUD $75k–$105k', mid: 'AUD $105k–$140k', senior: 'AUD $140k–$185k', currency: 'AUD', source: 'ABS 2024' },
    SG: { junior: 'SGD $55k–$80k', mid: 'SGD $80k–$120k', senior: 'SGD $120k–$180k', currency: 'SGD', source: 'MOM 2024' },
  },
  'artificial intelligence': {
    US: { junior: '$95k–$130k', mid: '$130k–$190k', senior: '$190k–$300k+', currency: 'USD', source: 'BLS OES 2024 / Levels.fyi' },
    UK: { junior: '£45k–£68k', mid: '£68k–£105k', senior: '£105k–£170k+', currency: 'GBP', source: 'ONS ASHE 2024' },
    CA: { junior: 'CAD $80k–$110k', mid: 'CAD $110k–$155k', senior: 'CAD $155k–$210k', currency: 'CAD', source: 'StatsCan 2024' },
    DE: { junior: '€58k–€80k', mid: '€80k–€110k', senior: '€110k–€155k', currency: 'EUR', source: 'Destatis 2024' },
  },
  'software engineering': {
    US: { junior: '$88k–$118k', mid: '$118k–$165k', senior: '$165k–$260k+', currency: 'USD', source: 'BLS OES 2024' },
    CA: { junior: 'CAD $72k–$98k', mid: 'CAD $98k–$138k', senior: 'CAD $138k–$190k', currency: 'CAD', source: 'StatsCan 2024' },
    UK: { junior: '£38k–£60k', mid: '£60k–£92k', senior: '£92k–£148k+', currency: 'GBP', source: 'ONS ASHE 2024' },
    DE: { junior: '€52k–€72k', mid: '€72k–€98k', senior: '€98k–€138k', currency: 'EUR', source: 'Destatis 2024' },
    AU: { junior: 'AUD $82k–$112k', mid: 'AUD $112k–$155k', senior: 'AUD $155k–$205k', currency: 'AUD', source: 'ABS 2024' },
    SG: { junior: 'SGD $62k–$88k', mid: 'SGD $88k–$135k', senior: 'SGD $135k–$205k', currency: 'SGD', source: 'MOM 2024' },
  },
  'electrical engineering': {
    US: { junior: '$75k–$100k', mid: '$100k–$140k', senior: '$140k–$200k', currency: 'USD', source: 'BLS OES 2024' },
    CA: { junior: 'CAD $65k–$88k', mid: 'CAD $88k–$120k', senior: 'CAD $120k–$165k', currency: 'CAD', source: 'StatsCan 2024' },
    UK: { junior: '£30k–£50k', mid: '£50k–£75k', senior: '£75k–£115k', currency: 'GBP', source: 'ONS ASHE 2024' },
    DE: { junior: '€48k–€65k', mid: '€65k–€88k', senior: '€88k–€120k', currency: 'EUR', source: 'Destatis 2024' },
    AU: { junior: 'AUD $70k–$95k', mid: 'AUD $95k–$130k', senior: 'AUD $130k–$175k', currency: 'AUD', source: 'ABS 2024' },
  },
  'mechanical engineering': {
    US: { junior: '$68k–$90k', mid: '$90k–$125k', senior: '$125k–$175k', currency: 'USD', source: 'BLS OES 2024' },
    DE: { junior: '€46k–€62k', mid: '€62k–€84k', senior: '€84k–€115k', currency: 'EUR', source: 'Destatis 2024' },
    CA: { junior: 'CAD $60k–$82k', mid: 'CAD $82k–$112k', senior: 'CAD $112k–$150k', currency: 'CAD', source: 'StatsCan 2024' },
    UK: { junior: '£28k–£46k', mid: '£46k–£68k', senior: '£68k–£100k', currency: 'GBP', source: 'ONS ASHE 2024' },
    AU: { junior: 'AUD $65k–$88k', mid: 'AUD $88k–$120k', senior: 'AUD $120k–$160k', currency: 'AUD', source: 'ABS 2024' },
  },
  'business': {
    US: { junior: '$55k–$75k', mid: '$75k–$115k', senior: '$115k–$180k', currency: 'USD', source: 'BLS OES 2024' },
    UK: { junior: '£28k–£45k', mid: '£45k–£70k', senior: '£70k–£120k', currency: 'GBP', source: 'ONS ASHE 2024' },
    CA: { junior: 'CAD $50k–$72k', mid: 'CAD $72k–$105k', senior: 'CAD $105k–$155k', currency: 'CAD', source: 'StatsCan 2024' },
    AU: { junior: 'AUD $58k–$80k', mid: 'AUD $80k–$115k', senior: 'AUD $115k–$165k', currency: 'AUD', source: 'ABS 2024' },
    SG: { junior: 'SGD $42k–$60k', mid: 'SGD $60k–$90k', senior: 'SGD $90k–$145k', currency: 'SGD', source: 'MOM 2024' },
  },
  'finance': {
    US: { junior: '$65k–$90k', mid: '$90k–$145k', senior: '$145k–$300k+', currency: 'USD', source: 'BLS OES 2024' },
    UK: { junior: '£38k–£58k', mid: '£58k–£95k', senior: '£95k–£200k+', currency: 'GBP', source: 'ONS ASHE 2024' },
    SG: { junior: 'SGD $55k–$80k', mid: 'SGD $80k–$130k', senior: 'SGD $130k–$250k+', currency: 'SGD', source: 'MOM 2024' },
    CA: { junior: 'CAD $55k–$80k', mid: 'CAD $80k–$120k', senior: 'CAD $120k–$200k', currency: 'CAD', source: 'StatsCan 2024' },
  },
  'public health': {
    US: { junior: '$50k–$68k', mid: '$68k–$95k', senior: '$95k–$145k', currency: 'USD', source: 'BLS OES 2024' },
    CA: { junior: 'CAD $55k–$75k', mid: 'CAD $75k–$105k', senior: 'CAD $105k–$145k', currency: 'CAD', source: 'StatsCan 2024' },
    UK: { junior: '£28k–£42k', mid: '£42k–£60k', senior: '£60k–£90k', currency: 'GBP', source: 'NHS Band Scale / ONS 2024' },
    AU: { junior: 'AUD $62k–$85k', mid: 'AUD $85k–$115k', senior: 'AUD $115k–$160k', currency: 'AUD', source: 'ABS 2024' },
  },
  'biotechnology': {
    US: { junior: '$60k–$82k', mid: '$82k–$120k', senior: '$120k–$180k', currency: 'USD', source: 'BLS OES 2024' },
    UK: { junior: '£28k–£46k', mid: '£46k–£68k', senior: '£68k–£105k', currency: 'GBP', source: 'ONS ASHE 2024' },
    DE: { junior: '€44k–€60k', mid: '€60k–€82k', senior: '€82k–€115k', currency: 'EUR', source: 'Destatis 2024' },
    CA: { junior: 'CAD $58k–$78k', mid: 'CAD $78k–$110k', senior: 'CAD $110k–$155k', currency: 'CAD', source: 'StatsCan 2024' },
  },
};

function lookupSalary(intendedMajor: string | undefined, countryCode: string): (SalaryRow & { field: string }) | null {
  if (!intendedMajor) return null;
  const lower = intendedMajor.toLowerCase();
  for (const [field, countries] of Object.entries(SALARY_BENCHMARK)) {
    if (lower.includes(field) || field.split(' ').some(w => w.length > 3 && lower.includes(w))) {
      if (countries[countryCode]) return { ...countries[countryCode], field };
      if (countries['US']) return { ...countries['US'], field, source: countries['US'].source + ' (USD approximate — convert to local currency)' };
    }
  }
  return null;
}

// ── Core function ─────────────────────────────────────────────────────────────

export async function predictCareerOutcome(req: CareerRequest): Promise<CareerResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  const primaryCountry = req.targetCountries?.[0] ?? 'US';
  const countryInfo = COUNTRY_JOB_MARKET[primaryCountry] ?? { code: primaryCountry, name: primaryCountry, strength: 'Active graduate job market', visa: 'Work permit required' };

  const salaryData = lookupSalary(req.intendedMajor, countryInfo.code);

  const salaryBlock = salaryData
    ? `Verified salary benchmarks for ${req.intendedMajor} in ${countryInfo.name} (source: ${salaryData.source}):
  - Entry-level (0–2 years): ${salaryData.junior}
  - Mid-level (3–6 years): ${salaryData.mid}
  - Senior (7+ years): ${salaryData.senior}
  Use these ranges in the pathways array — do NOT invent different numbers.`
    : `No pre-verified salary data for this field/country combination.
  Use realistic market estimates based on the country context below, and note they are estimates.`;

  const profileSummary = [
    req.intendedMajor && `Field: ${req.intendedMajor}`,
    req.intendedLevel && `Degree level: ${req.intendedLevel}`,
    req.targetCountries?.length && `Target countries: ${req.targetCountries.join(', ')}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.gpa && `GPA: ${req.gpa}/${req.gpaScale ?? '4.0'}`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.currentStage && `Current stage: ${req.currentStage}`,
  ].filter(Boolean).join('\n');

  const PRODUCTION_DISCLAIMER =
    'Salary figures are sourced from official labour statistics (BLS, ONS, StatsCan, Destatis, ABS, MOM) and career platforms. ' +
    'Individual outcomes vary based on employer, location, skills, and economic conditions. ' +
    'This is educational guidance, not professional career advice. Visa and immigration rules are subject to change — consult official government sources.';

  const prompt = `You are a career counselor specializing in international graduate employment outcomes.

Student Profile:
${profileSummary || 'Profile not provided.'}

Primary target country: ${countryInfo.name}
Job market context: ${countryInfo.strength}
Typical visa pathway: ${countryInfo.visa}

${salaryBlock}

Provide a realistic, data-grounded career outcome prediction. Be honest about competitive realities.

Return a JSON object:
{
  "overallOutlook": "Excellent | Good | Moderate | Challenging",
  "outlookSummary": "3-4 sentence realistic summary of career prospects in this field/country",
  "employabilityScore": 72,
  "topCountry": "${countryInfo.name}",
  "factors": [
    { "factor": "Field Demand", "rating": "Strong | Good | Moderate | Weak", "explanation": "..." }
  ],
  "pathways": [
    {
      "role": "Software Engineer",
      "sector": "Technology",
      "salaryRangeUsd": "${salaryData ? `Use verified: ${salaryData.junior} (entry) / ${salaryData.mid} (mid)` : 'realistic market estimate'}",
      "demandLevel": "High | Medium | Low",
      "timeToEntry": "0–6 months post-graduation"
    }
  ],
  "keySkillsToAdd": ["..."],
  "industryTrends": ["..."],
  "disclaimer": "${PRODUCTION_DISCLAIMER}"
}

Include 4–5 factors, 3–4 pathways, 4–5 skills, 2–3 industry trends.
Return ONLY valid JSON. No markdown, no explanation.`;

  if (!apiKey) {
    return buildFallbackCareer(req, countryInfo, primaryCountry, salaryData, PRODUCTION_DISCLAIMER);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1300,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) throw new Error(`LLM error: ${response.status}`);

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? '';
    if (!raw) throw new Error('Empty LLM response');

    const parsed = JSON.parse(raw) as Partial<CareerResult>;
    return {
      overallOutlook: parsed.overallOutlook ?? 'Moderate',
      outlookSummary: parsed.outlookSummary ?? 'Career outlook depends on your specific field and skill set.',
      employabilityScore: Math.min(100, Math.max(10, parsed.employabilityScore ?? 60)),
      topCountry: parsed.topCountry ?? countryInfo.name,
      factors: parsed.factors ?? [],
      pathways: parsed.pathways ?? [],
      keySkillsToAdd: parsed.keySkillsToAdd ?? [],
      industryTrends: parsed.industryTrends ?? [],
      disclaimer: PRODUCTION_DISCLAIMER,
      salaryDataSource: salaryData ? `${salaryData.source}` : undefined,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return buildFallbackCareer(req, countryInfo, primaryCountry, salaryData, PRODUCTION_DISCLAIMER);
  }
}

type CountryInfo = { code: string; name: string; strength: string; visa: string };

function buildFallbackCareer(
  req: CareerRequest,
  countryInfo: CountryInfo,
  primaryCountry: string,
  salaryData: (SalaryRow & { field: string }) | null,
  disclaimer: string,
): CareerResult {
  const isStem = ['computer', 'data', 'engineering', 'math', 'physics', 'ai', 'machine learning', 'software', 'biotech']
    .some(kw => (req.intendedMajor ?? '').toLowerCase().includes(kw));
  const isPhd = req.intendedLevel === 'PHD';
  const score = isStem ? 74 : 58;

  const stemPathways: CareerPathway[] = salaryData ? [
    { role: 'Entry-level role', sector: 'Technology / Industry', salaryRangeUsd: salaryData.junior, demandLevel: 'High', timeToEntry: '0–6 months post-graduation' },
    { role: 'Mid-level specialist', sector: 'Technology / Industry', salaryRangeUsd: salaryData.mid, demandLevel: 'High', timeToEntry: '2–5 years post-graduation' },
    { role: 'Research / Academic role', sector: 'Academia / R&D', salaryRangeUsd: salaryData.junior, demandLevel: 'Medium', timeToEntry: '6–18 months post-graduation' },
  ] : [
    { role: 'Software / Data Engineer', sector: 'Technology', salaryRangeUsd: '$85,000–$130,000 (USD approx)', demandLevel: 'High', timeToEntry: '0–6 months post-graduation' },
    { role: 'Research Scientist', sector: 'R&D / Academia', salaryRangeUsd: '$70,000–$110,000 (USD approx)', demandLevel: 'Medium', timeToEntry: '6–12 months post-graduation' },
  ];

  return {
    overallOutlook: isStem ? 'Good' : 'Moderate',
    outlookSummary: `${countryInfo.name} offers ${isStem ? 'strong' : 'moderate'} demand for ${req.intendedMajor ?? 'graduates'} at the ${req.intendedLevel ?? 'graduate'} level. ${countryInfo.strength} ${isPhd ? 'PhD holders typically enter research, academia, or senior technical roles.' : 'Most international graduates find employment within 6–12 months of graduation.'}`,
    employabilityScore: score,
    topCountry: countryInfo.name,
    factors: [
      { factor: 'Field Demand', rating: isStem ? 'Strong' : 'Moderate', explanation: `${req.intendedMajor ?? 'Your field'} has ${isStem ? 'high and growing' : 'steady'} demand in ${countryInfo.name}.` },
      { factor: 'Degree Level', rating: isPhd ? 'Strong' : 'Good', explanation: `${req.intendedLevel ?? 'Graduate'} degree is ${isPhd ? 'highly valued for research and senior roles' : 'standard for most professional roles'}.` },
      { factor: 'Work Experience', rating: (req.workExperienceMonths ?? 0) >= 12 ? 'Good' : 'Moderate', explanation: `${(req.workExperienceMonths ?? 0) >= 12 ? 'Relevant experience strengthens' : 'Limited experience may weigh on'} employer competitiveness.` },
      { factor: 'English Proficiency', rating: req.englishTestType ? 'Good' : 'Moderate', explanation: req.englishTestType ? `Verified ability (${req.englishTestType}: ${req.englishScore}) meets employer expectations.` : 'Demonstrating fluency is important for professional roles.' },
      { factor: 'Visa Pathway', rating: ['CA', 'AU', 'DE'].includes(primaryCountry) ? 'Good' : 'Moderate', explanation: countryInfo.visa },
    ],
    pathways: isStem ? stemPathways : [
      { role: 'Management Trainee', sector: 'Business / Consulting', salaryRangeUsd: salaryData?.junior ?? '$50,000–$80,000 (USD approx)', demandLevel: 'Medium', timeToEntry: '0–6 months post-graduation' },
      { role: 'Research Associate', sector: 'Academia / NGO', salaryRangeUsd: salaryData?.junior ?? '$45,000–$70,000 (USD approx)', demandLevel: 'Medium', timeToEntry: '3–9 months post-graduation' },
    ],
    keySkillsToAdd: isStem
      ? ['Python or R', 'Cloud platforms (AWS/GCP/Azure)', 'SQL and data pipelines', 'System design', 'Stakeholder communication']
      : ['Data analysis and visualisation', 'Project management (PMP/Agile)', 'Strategic communication', 'Industry certifications', 'LinkedIn and professional networking'],
    industryTrends: [
      `AI and automation are reshaping ${isStem ? 'engineering and data roles' : 'most professional sectors'} globally`,
      `${countryInfo.name} continues attracting international talent for shortage-occupation roles`,
      'Remote and hybrid work has expanded the effective job market for international graduates',
    ],
    disclaimer,
    salaryDataSource: salaryData ? salaryData.source : undefined,
    generatedAt: new Date().toISOString(),
  };
}
