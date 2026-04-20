/**
 * PR & Immigration Insight Engine — provides country-specific visa and
 * permanent residency pathway guidance for international students.
 *
 * Note: Immigration rules change frequently. All content is labeled as
 * guidance only and includes policy-change disclaimers.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'; // fallback

export interface ImmigrationRequest {
  targetCountries?: string[];
  intendedLevel?: string;
  intendedMajor?: string;
  workExperienceMonths?: number;
  englishTestType?: string;
  englishScore?: number;
  currentStage?: string;
  fundingNeed?: boolean;
}

export interface ImmigrationStep {
  phase: string;
  title: string;
  description: string;
  typicalDuration: string;
  keyCriteria: string[];
  pitfalls: string[];
}

export interface CountryPathway {
  countryCode: string;
  countryName: string;
  overallFeasibility: 'High' | 'Medium' | 'Low';
  feasibilityReason: string;
  studyVisaType: string;
  postStudyWorkVisa: string;
  postStudyWorkDuration: string;
  prPathway: string;
  prTimeline: string;
  pointsRequired?: number;
  estimatedPoints?: number;
  steps: ImmigrationStep[];
  advantages: string[];
  challenges: string[];
  officialSource: string;
}

export interface ImmigrationResult {
  pathways: CountryPathway[];
  bestFitCountry: string;
  bestFitReason: string;
  generalTips: string[];
  disclaimer: string;
  lastUpdated: string;
  generatedAt: string;
}

const PATHWAY_TEMPLATES: Record<string, Omit<CountryPathway, 'overallFeasibility' | 'feasibilityReason' | 'estimatedPoints' | 'steps'>> = {
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    studyVisaType: 'Study Permit',
    postStudyWorkVisa: 'Post-Graduation Work Permit (PGWP)',
    postStudyWorkDuration: 'Up to 3 years (STEM: up to 5 years)',
    prPathway: 'Express Entry (CEC / FSW) or Provincial Nominee Program (PNP)',
    prTimeline: '2–4 years after graduation',
    pointsRequired: 67,
    advantages: [
      'PGWP allows up to 3–5 years of Canadian work experience',
      'Express Entry CRS is accessible with Canadian work experience',
      'Pathway to citizenship after 3 of 5 years as PR',
      'Provincial nominee programs offer additional routes',
      'Healthcare and family-friendly policies',
    ],
    challenges: [
      'CRS score cutoffs fluctuate (often 480–530); check current draws',
      'Some provinces have specific occupation and language requirements',
      'Cost of living is high in major cities (Toronto, Vancouver)',
    ],
    officialSource: 'https://www.canada.ca/en/immigration-refugees-citizenship.html',
  },
  US: {
    countryCode: 'US',
    countryName: 'United States',
    studyVisaType: 'F-1 Student Visa',
    postStudyWorkVisa: 'OPT (Optional Practical Training) + STEM OPT Extension',
    postStudyWorkDuration: '12 months OPT + 24 months STEM extension = up to 36 months',
    prPathway: 'H-1B visa (employer-sponsored) → EB-2/EB-3 Green Card',
    prTimeline: '5–15+ years (heavily backlogged for most nationalities)',
    advantages: [
      'World-class research universities and industry networks',
      'STEM OPT provides 3 years of work authorization',
      'Top salaries globally, especially in tech and finance',
      'Entrepreneurial ecosystem (startup visas, O-1 options)',
    ],
    challenges: [
      'H-1B visa is lottery-based (capped at 85,000/year) — no guaranteed path',
      'Green Card backlogs are severe for Indian and Chinese nationals (10–50+ years)',
      'No stable post-study PR route; immigration path is employer-dependent',
      'Political volatility around immigration policy',
    ],
    officialSource: 'https://travel.state.gov/content/travel/en/us-visas/study.html',
  },
  UK: {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    studyVisaType: 'Student Visa (Tier 4)',
    postStudyWorkVisa: 'Graduate Visa',
    postStudyWorkDuration: '2 years (PhD: 3 years)',
    prPathway: 'Skilled Worker Visa → Indefinite Leave to Remain (ILR)',
    prTimeline: '5 years of continuous lawful residence',
    advantages: [
      'Graduate Visa allows 2–3 years of open work authorization (no employer sponsorship)',
      'No language test needed for Graduate Visa if studied in English',
      'Strong finance, consulting, and tech job markets',
      'ILR after 5 years with Skilled Worker visa',
    ],
    challenges: [
      'Skilled Worker Visa requires employer sponsorship and salary thresholds (£38,700+)',
      'Salary requirements exclude many entry-level roles',
      'Post-Brexit EU talent competition has increased',
      'NHS surcharge adds significant upfront cost',
    ],
    officialSource: 'https://www.gov.uk/student-visa',
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    studyVisaType: 'Student Visa (Subclass 500)',
    postStudyWorkVisa: 'Temporary Graduate Visa (Subclass 485)',
    postStudyWorkDuration: '2–4 years depending on qualification and location',
    prPathway: 'Skilled Independent (189) / Skilled Nominated (190) / Regional (491)',
    prTimeline: '2–5 years after graduation',
    advantages: [
      '485 visa provides 2–4 years of work rights without employer sponsorship',
      'Points-based skilled migration is transparent and achievable',
      'STEM, healthcare, engineering, and trades are in high demand',
      'Regional study can increase points allocation',
    ],
    challenges: [
      'State nomination invitation cutoffs can be competitive',
      'Points requirement (65+) means profile must be carefully optimized',
      'Invitation rounds for skilled migration can be irregular',
    ],
    officialSource: 'https://immi.homeaffairs.gov.au/',
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    studyVisaType: 'Student Visa (Nationales Visum)',
    postStudyWorkVisa: 'Job Seeker Visa (18-month job search period)',
    postStudyWorkDuration: '18 months job search + open-ended work permit upon employment',
    prPathway: 'Settlement Permit (Niederlassungserlaubnis) after 2–5 years of work',
    prTimeline: '4–8 years (2 years with EU Blue Card in shortage occupations)',
    advantages: [
      'Tuition is free or very low even for international students',
      'EU Blue Card is accessible with a relevant job offer and degree',
      'Accelerated settlement permit after just 2 years with EU Blue Card in shortage occupations',
      'Strong engineering, automotive, and manufacturing industries',
    ],
    challenges: [
      'German language skills (B1/B2) are often required for full integration and settlement',
      'Finding English-language jobs outside major cities can be difficult',
      'Bureaucracy around visa extensions can be complex',
    ],
    officialSource: 'https://www.make-it-in-germany.com/en/',
  },
};

export async function getImmigrationGuidance(req: ImmigrationRequest): Promise<ImmigrationResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
  const targetCodes = (req.targetCountries ?? ['CA', 'UK']).filter(c => PATHWAY_TEMPLATES[c]);

  if (targetCodes.length === 0) targetCodes.push('CA', 'UK');

  const profileSummary = [
    req.intendedLevel && `Degree level: ${req.intendedLevel}`,
    req.intendedMajor && `Major: ${req.intendedMajor}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.currentStage && `Current stage: ${req.currentStage}`,
  ].filter(Boolean).join('\n');

  const prompt = `You are an immigration guidance specialist helping international students understand PR and visa pathways.

Student Profile:
${profileSummary || 'Profile not fully provided.'}

Target countries: ${targetCodes.join(', ')}

For each country, assess feasibility and provide a step-by-step pathway. Consider:
- English proficiency requirement match
- Work experience and degree level relevance
- Points/criteria likely achievable by this profile
- Realistic timeline

Return a JSON object with this structure:
{
  "pathways": [
    {
      "countryCode": "CA",
      "feasibilityAssessment": {
        "rating": "High | Medium | Low",
        "reason": "2-3 sentence explanation specific to this student's profile"
      },
      "estimatedPoints": 75,
      "steps": [
        {
          "phase": "Study Phase",
          "title": "Obtain Study Permit",
          "description": "Apply for study permit 3-6 months before program start",
          "typicalDuration": "3-6 months processing",
          "keyCriteria": ["Acceptance letter", "Proof of funds", "Valid passport"],
          "pitfalls": ["Late application", "Insufficient financial evidence"]
        }
      ]
    }
  ],
  "bestFitCountry": "CA",
  "bestFitReason": "2-3 sentences why this is the best option for this student",
  "generalTips": ["Tip 1", "Tip 2", "Tip 3"]
}

Provide 3-5 steps per country. Be specific to the student's profile.
Return ONLY valid JSON. No markdown.`;

  const basePathways = targetCodes.slice(0, 3).map(code => {
    const template = PATHWAY_TEMPLATES[code];
    return {
      ...template,
      overallFeasibility: 'Medium' as const,
      feasibilityReason: 'Feasibility depends on your specific profile details.',
      estimatedPoints: undefined as number | undefined,
      steps: buildDefaultSteps(code),
    };
  });

  if (!apiKey) {
    return buildFallbackImmigration(targetCodes, basePathways);
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
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) throw new Error(`LLM error: ${response.status}`);

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? '';
    if (!raw) throw new Error('Empty LLM response');

    const parsed = JSON.parse(raw) as {
      pathways?: Array<{
        countryCode: string;
        feasibilityAssessment?: { rating?: string; reason?: string };
        estimatedPoints?: number;
        steps?: ImmigrationStep[];
      }>;
      bestFitCountry?: string;
      bestFitReason?: string;
      generalTips?: string[];
    };

    const enrichedPathways: CountryPathway[] = basePathways.map(base => {
      const llmData = parsed.pathways?.find(p => p.countryCode === base.countryCode);
      return {
        ...base,
        overallFeasibility: (llmData?.feasibilityAssessment?.rating ?? 'Medium') as 'High' | 'Medium' | 'Low',
        feasibilityReason: llmData?.feasibilityAssessment?.reason ?? base.feasibilityReason,
        estimatedPoints: llmData?.estimatedPoints ?? base.estimatedPoints,
        steps: llmData?.steps ?? base.steps,
      };
    });

    const bestFit = parsed.bestFitCountry ?? targetCodes[0];
    const bestFitTemplate = PATHWAY_TEMPLATES[bestFit];

    return {
      pathways: enrichedPathways,
      bestFitCountry: bestFitTemplate?.countryName ?? bestFit,
      bestFitReason: parsed.bestFitReason ?? `${bestFitTemplate?.countryName ?? bestFit} offers the clearest pathway for your profile.`,
      generalTips: parsed.generalTips ?? defaultTips(),
      disclaimer: 'Immigration policies change frequently. This guidance is for informational purposes only and does not constitute legal or immigration advice. Always verify current requirements with official government sources or a registered immigration consultant before making decisions.',
      lastUpdated: '2025-01',
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return buildFallbackImmigration(targetCodes, basePathways);
  }
}

function buildDefaultSteps(countryCode: string): ImmigrationStep[] {
  const steps: Record<string, ImmigrationStep[]> = {
    CA: [
      { phase: 'Pre-Arrival', title: 'Obtain Study Permit', description: 'Apply for a Canadian study permit from your home country at least 3 months before your program starts.', typicalDuration: '4–12 weeks processing', keyCriteria: ['Offer letter from DLI', 'Proof of financial support', 'Biometrics'], pitfalls: ['Incomplete financial documentation', 'Applying too close to start date'] },
      { phase: 'During Study', title: 'Maintain Full-Time Enrollment', description: 'Remain enrolled full-time and maintain legal status throughout your studies to preserve PGWP eligibility.', typicalDuration: 'Full program duration', keyCriteria: ['Full-time enrollment', 'Good academic standing', 'Valid study permit'], pitfalls: ['Dropping to part-time without authorization', 'Letting permit expire'] },
      { phase: 'Post-Graduation', title: 'Apply for PGWP', description: 'Apply for a Post-Graduation Work Permit within 180 days of receiving your final marks. PGWP length matches program length (max 3 years).', typicalDuration: '4–8 weeks processing', keyCriteria: ['Graduation confirmation', 'Valid passport', 'Biometrics'], pitfalls: ['Missing 180-day window', 'Incorrect application type'] },
      { phase: 'Work Phase', title: 'Build Canadian Work Experience', description: 'Work in your field for 1 year to qualify for Canadian Experience Class (CEC) under Express Entry.', typicalDuration: '12+ months', keyCriteria: ['NOC 0/A/B skill level job', 'Full-time work', 'Minimum wages'], pitfalls: ['Working in a low-skill NOC category', 'Not documenting work properly for IRCC'] },
      { phase: 'PR Application', title: 'Apply for Permanent Residence via Express Entry', description: 'Create an Express Entry profile, receive an ITA, and submit a complete PR application.', typicalDuration: '6–12 months from ITA to PR', keyCriteria: ['Comprehensive Ranking System (CRS) score above draw cutoff', 'Language test', 'Educational credential assessment'], pitfalls: ['Low CRS score due to unverified credentials', 'Missing documents in application'] },
    ],
    UK: [
      { phase: 'Pre-Arrival', title: 'Obtain Student Visa', description: 'Apply for a UK Student Visa (formerly Tier 4) at least 3 months before your course starts. You need a CAS from your university.', typicalDuration: '3–4 weeks processing', keyCriteria: ['CAS from university', 'Proof of English (IELTS UKVI 5.5+)', 'Proof of maintenance funds'], pitfalls: ['Using standard IELTS instead of IELTS UKVI', 'Insufficient maintenance funds'] },
      { phase: 'Post-Graduation', title: 'Switch to Graduate Visa', description: 'Apply to switch to the Graduate Visa within your Student Visa validity period. No employer sponsorship required.', typicalDuration: '8 weeks processing', keyCriteria: ['UK degree completion', 'Valid Student Visa at time of application'], pitfalls: ['Applying after Student Visa expiry', 'Not completing the full UK course'] },
      { phase: 'Work Phase', title: 'Find Skilled Work and Switch to Skilled Worker Visa', description: 'Find a sponsored role paying above the salary threshold and apply to switch from Graduate Visa to Skilled Worker Visa.', typicalDuration: '8–12 weeks per application', keyCriteria: ['Licensed sponsor employer', 'Salary ≥ £38,700 (general threshold)', 'Certificate of Sponsorship (CoS)'], pitfalls: ['Employer not on UKVI sponsor register', 'Salary below threshold after allowances'] },
      { phase: 'PR Application', title: 'Apply for Indefinite Leave to Remain (ILR)', description: 'After 5 years of continuous lawful residence (Skilled Worker or other eligible visa), apply for ILR.', typicalDuration: '2–6 months processing', keyCriteria: ['5 years continuous residence', 'Life in the UK test (75% pass rate)', 'English language', 'No serious criminal record'], pitfalls: ['Gaps in continuous residence', 'Absences exceeding 180 days/year'] },
    ],
    AU: [
      { phase: 'Pre-Arrival', title: 'Obtain Student Visa (Subclass 500)', description: 'Apply for an Australian Student Visa with a CoE from your institution. Health insurance (OSHC) is mandatory.', typicalDuration: '4–8 weeks processing', keyCriteria: ['Confirmation of Enrolment (CoE)', 'OSHC insurance', 'Genuine Temporary Entrant requirement'], pitfalls: ['Insufficient financial evidence', 'Not meeting genuine temporary entrant criteria'] },
      { phase: 'Post-Graduation', title: 'Apply for Temporary Graduate Visa (Subclass 485)', description: 'Apply for the 485 visa within 6 months of graduation. Duration depends on your qualification (2–4 years).', typicalDuration: '4–8 weeks processing', keyCriteria: ['Eligible qualification', 'English: IELTS 6.0+', 'Skills assessment (for some streams)'], pitfalls: ['Applying outside the 6-month window', 'Not meeting English requirement'] },
      { phase: 'Skill Assessment', title: 'Get Skills Assessed by Relevant Body', description: 'For skilled migration, have your qualifications assessed by the relevant assessing authority for your occupation.', typicalDuration: '4–12 weeks depending on body', keyCriteria: ['Relevant degree/occupation match', 'Work experience documentation'], pitfalls: ['Choosing wrong assessing authority', 'Incomplete documentation for assessment'] },
      { phase: 'EOI Phase', title: 'Submit Expression of Interest (SkillSelect)', description: 'Submit an EOI in SkillSelect. You need 65+ points to be eligible. Invitation rounds occur regularly.', typicalDuration: 'Variable — depends on points score and occupation in demand', keyCriteria: ['65+ points minimum', 'Skills assessment completed', 'Occupation on relevant list'], pitfalls: ['Points miscalculation', 'Not maximising available points (regional study, NAATI, etc.)'] },
    ],
    DE: [
      { phase: 'Pre-Arrival', title: 'Obtain Student Visa', description: 'Apply for a German student visa at your local German embassy. A blocked account (€11,208/year) is required.', typicalDuration: '4–12 weeks processing', keyCriteria: ['University admission letter', 'Blocked account (Sperrkonto)', 'German or English language proficiency for program'], pitfalls: ['Late visa application', 'Incorrect blocked account amount'] },
      { phase: 'Post-Graduation', title: 'Obtain Job Seeker Visa (Aufenthaltserlaubnis zur Jobsuche)', description: 'Apply for an 18-month job seeker visa to find employment in Germany after graduation.', typicalDuration: '4–8 weeks at local Foreigners Registration Office', keyCriteria: ['German degree or equivalent recognition', 'Financial means for 18 months', 'Registered address'], pitfalls: ['Degree not recognised without anabin/ENIC check', 'Insufficient funds documentation'] },
      { phase: 'Employment', title: 'Obtain Work Permit or EU Blue Card', description: 'With a job offer meeting salary threshold (EU Blue Card: €45,300+; shortage occupations: €35,100+), switch to work permit.', typicalDuration: '4–12 weeks', keyCriteria: ['Job offer from German employer', 'Recognised degree', 'Salary above threshold'], pitfalls: ['Degree recognition delays', 'Salary below EU Blue Card threshold'] },
      { phase: 'PR Application', title: 'Apply for Settlement Permit (Niederlassungserlaubnis)', description: 'After 4 years of employment (or 2 years with EU Blue Card in shortage occupations), apply for permanent settlement.', typicalDuration: '1–3 months', keyCriteria: ['Language: German B1 (general) or B2 (some routes)', 'Pension contributions', 'Secure livelihood'], pitfalls: ['Insufficient German language level', 'Gaps in employment/pension contributions'] },
    ],
  };
  return steps[countryCode] ?? [];
}

function buildFallbackImmigration(codes: string[], pathways: CountryPathway[]): ImmigrationResult {
  const best = codes.includes('CA') ? 'Canada' : pathways[0]?.countryName ?? codes[0];
  return {
    pathways,
    bestFitCountry: best,
    bestFitReason: `${best} offers a structured and transparent pathway for international graduates, with clear post-study work and permanent residency routes accessible within 3–5 years of graduation.`,
    generalTips: defaultTips(),
    disclaimer: 'Immigration policies change frequently. This guidance is for informational purposes only and does not constitute legal or immigration advice. Always verify current requirements with official government sources or a registered immigration consultant before making decisions.',
    lastUpdated: '2025-01',
    generatedAt: new Date().toISOString(),
  };
}

function defaultTips(): string[] {
  return [
    'Start your visa application at least 3–6 months before your intended arrival date',
    'Keep all immigration documents organized and track every visa expiry date',
    'Ensure your qualifications are recognized/assessed in your target country early',
    'Build language proficiency above minimums — higher scores expand your options significantly',
    'Consider regional or smaller cities where PR points and job competition may be more favorable',
    'Consult a registered immigration consultant or lawyer for complex cases or appeals',
  ];
}
