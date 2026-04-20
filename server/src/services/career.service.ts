/**
 * Career Outcome Predictor Service — predicts job market outcomes and
 * employability based on field, country, degree level, and profile.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'; // fallback

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
  employabilityScore: number; // 0-100
  topCountry: string;
  factors: CareerOutlookFactor[];
  pathways: CareerPathway[];
  keySkillsToAdd: string[];
  industryTrends: string[];
  disclaimer: string;
  generatedAt: string;
}

const COUNTRY_JOB_MARKET: Record<string, { name: string; strength: string; visa: string }> = {
  US: { name: 'United States', strength: 'Largest tech & finance job market globally. High salaries but competitive visa (H-1B lottery).', visa: 'OPT (3yr STEM extension) → H-1B lottery' },
  CA: { name: 'Canada', strength: 'Strong demand in tech, healthcare, engineering. Express Entry provides clear PR pathway.', visa: 'PGWP (up to 3yr) → Express Entry PR' },
  UK: { name: 'United Kingdom', strength: 'Strong finance, consulting, and tech hubs. Graduate Visa allows 2yr post-study work.', visa: 'Graduate Visa (2yr) → Skilled Worker visa' },
  DE: { name: 'Germany', strength: 'Engineering and manufacturing hub. Strong demand for STEM graduates. EU Blue Card available.', visa: 'Job Seeker Visa (6mo) → EU Blue Card' },
  AU: { name: 'Australia', strength: 'Growing tech and healthcare sector. TSS/Skilled Migration visa pathways are accessible.', visa: 'Post-Study Work Visa (2-4yr) → Skilled Migration' },
  NL: { name: 'Netherlands', strength: 'Major EU tech hub (ASML, Philips, Booking.com). Orientation Year permit for graduates.', visa: 'Orientation Year (1yr) → Highly Skilled Migrant permit' },
  SE: { name: 'Sweden', strength: 'Thriving startup ecosystem (Spotify, Klarna). Attractive for tech and engineering roles.', visa: 'Work permit (employer-sponsored)' },
  SG: { name: 'Singapore', strength: 'Asia-Pacific fintech and tech hub. Strong demand for data, AI, and finance professionals.', visa: 'Employment Pass (EP) or S Pass' },
};

export async function predictCareerOutcome(req: CareerRequest): Promise<CareerResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  const primaryCountry = req.targetCountries?.[0] ?? 'US';
  const countryInfo = COUNTRY_JOB_MARKET[primaryCountry] ?? { name: primaryCountry, strength: 'Active graduate job market', visa: 'Work permit required' };

  const profileSummary = [
    req.intendedMajor && `Field: ${req.intendedMajor}`,
    req.intendedLevel && `Degree level: ${req.intendedLevel}`,
    req.targetCountries?.length && `Target countries: ${req.targetCountries.join(', ')}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.gpa && `GPA: ${req.gpa}/${req.gpaScale ?? '4.0'}`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.currentStage && `Current stage: ${req.currentStage}`,
  ].filter(Boolean).join('\n');

  const prompt = `You are a career counselor specializing in international graduate employment outcomes.

Student Profile:
${profileSummary || 'Profile not provided.'}

Primary target country: ${countryInfo.name}
Job market context: ${countryInfo.strength}
Typical visa pathway: ${countryInfo.visa}

Provide a realistic, data-grounded career outcome prediction for this student. Be honest about competitive realities.

Return a JSON object with this exact structure:
{
  "overallOutlook": "Excellent | Good | Moderate | Challenging",
  "outlookSummary": "3-4 sentence realistic summary of career prospects in their field/country combination",
  "employabilityScore": 72,
  "topCountry": "${countryInfo.name}",
  "factors": [
    {
      "factor": "Field Demand",
      "rating": "Strong | Good | Moderate | Weak",
      "explanation": "Brief explanation of this factor"
    }
  ],
  "pathways": [
    {
      "role": "Software Engineer",
      "sector": "Technology",
      "salaryRangeUsd": "$90,000–$130,000",
      "demandLevel": "High | Medium | Low",
      "timeToEntry": "0–6 months post-graduation"
    }
  ],
  "keySkillsToAdd": ["Python", "AWS", "SQL"],
  "industryTrends": ["AI/ML roles growing 30% YoY", "Remote-first hiring expanding market access"],
  "disclaimer": "Career outcomes are estimates based on current market conditions and may change. Individual results depend on networking, skill development, and economic factors."
}

Include 4-5 factors, 3-4 career pathways, 4-5 key skills, and 2-3 industry trends.
Return ONLY valid JSON. No markdown, no explanation.`;

  if (!apiKey) {
    return buildFallbackCareer(req, countryInfo, primaryCountry);
  }

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
        temperature: 0.3,
        max_tokens: 1200,
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
      disclaimer: parsed.disclaimer ?? 'Career outcomes are estimates based on current market conditions.',
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return buildFallbackCareer(req, countryInfo, primaryCountry);
  }
}

function buildFallbackCareer(
  req: CareerRequest,
  countryInfo: { name: string; strength: string; visa: string },
  primaryCountry: string,
): CareerResult {
  const isStem = ['computer', 'data', 'engineering', 'math', 'physics', 'ai', 'machine learning']
    .some(kw => (req.intendedMajor ?? '').toLowerCase().includes(kw));
  const isPhd = req.intendedLevel === 'PHD';
  const score = isStem ? 72 : 58;

  return {
    overallOutlook: isStem ? 'Good' : 'Moderate',
    outlookSummary: `${countryInfo.name} offers ${isStem ? 'strong' : 'moderate'} demand for ${req.intendedMajor ?? 'graduates'} at the ${req.intendedLevel ?? 'graduate'} level. ${countryInfo.strength} ${isPhd ? 'PhD holders typically enter research, academia, or senior technical roles.' : 'Most international graduates find employment within 6-12 months of graduation.'}`,
    employabilityScore: score,
    topCountry: countryInfo.name,
    factors: [
      { factor: 'Field Demand', rating: isStem ? 'Strong' : 'Moderate', explanation: `${req.intendedMajor ?? 'Your field'} has ${isStem ? 'high and growing' : 'steady'} demand in ${countryInfo.name}.` },
      { factor: 'Degree Level', rating: isPhd ? 'Strong' : 'Good', explanation: `${req.intendedLevel ?? 'Graduate'} degree is ${isPhd ? 'highly valued for research and senior technical roles' : 'the standard requirement for most professional roles'}.` },
      { factor: 'Work Experience', rating: (req.workExperienceMonths ?? 0) >= 12 ? 'Good' : 'Moderate', explanation: `${(req.workExperienceMonths ?? 0) >= 12 ? 'Relevant experience strengthens' : 'Limited experience may weigh on'} employer competitiveness.` },
      { factor: 'English Proficiency', rating: req.englishTestType ? 'Good' : 'Moderate', explanation: req.englishTestType ? `Verified English ability (${req.englishTestType}: ${req.englishScore}) meets employer expectations.` : 'Demonstrating English fluency is important for most professional roles.' },
      { factor: 'Visa Pathway', rating: ['CA', 'AU', 'DE'].includes(primaryCountry) ? 'Good' : 'Moderate', explanation: countryInfo.visa },
    ],
    pathways: isStem ? [
      { role: 'Software Engineer', sector: 'Technology', salaryRangeUsd: '$85,000–$130,000', demandLevel: 'High', timeToEntry: '0–6 months post-graduation' },
      { role: 'Data Analyst / Scientist', sector: 'Technology / Finance', salaryRangeUsd: '$75,000–$120,000', demandLevel: 'High', timeToEntry: '0–6 months post-graduation' },
      { role: 'ML/AI Engineer', sector: 'Technology', salaryRangeUsd: '$100,000–$160,000', demandLevel: 'High', timeToEntry: '6–12 months post-graduation' },
      { role: 'Research Scientist', sector: 'Academia / R&D', salaryRangeUsd: '$80,000–$110,000', demandLevel: 'Medium', timeToEntry: '3–12 months post-graduation' },
    ] : [
      { role: 'Management Trainee', sector: 'Business / Consulting', salaryRangeUsd: '$50,000–$80,000', demandLevel: 'Medium', timeToEntry: '0–6 months post-graduation' },
      { role: 'Research Associate', sector: 'Academia / NGO', salaryRangeUsd: '$45,000–$70,000', demandLevel: 'Medium', timeToEntry: '3–9 months post-graduation' },
      { role: 'Project Coordinator', sector: 'Cross-sector', salaryRangeUsd: '$45,000–$65,000', demandLevel: 'Medium', timeToEntry: '0–9 months post-graduation' },
    ],
    keySkillsToAdd: isStem
      ? ['Python or R', 'Cloud platforms (AWS/GCP/Azure)', 'SQL and data pipelines', 'System design', 'Communication and stakeholder management']
      : ['Data analysis and visualization', 'Project management (PMP/Agile)', 'Strategic communication', 'Industry-specific certifications', 'Networking and LinkedIn presence'],
    industryTrends: [
      `AI and automation are reshaping ${isStem ? 'engineering and data roles' : 'most professional sectors'} globally`,
      `${countryInfo.name} continues to attract international talent for shortage-occupation roles`,
      'Remote and hybrid work has expanded the effective job market for international graduates',
    ],
    disclaimer: 'Career outcomes are estimates based on publicly available market data and general trends. Individual results vary significantly based on networking, specific skills, economic conditions, and employer preferences. This is not professional career advice.',
    generatedAt: new Date().toISOString(),
  };
}
