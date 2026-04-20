/**
 * Gap Fix Recommender Service — analyzes user profile weaknesses and
 * recommends concrete next steps: courses, certifications, projects, tests.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'; // fallback

export interface GapFixRequest {
  // Academic
  gpa?: number;
  gpaScale?: string;
  backlogs?: number;
  graduationYear?: number;
  // Tests
  englishTestType?: string;
  englishScore?: number;
  gre?: number;
  gmat?: number;
  // Experience
  workExperienceMonths?: number;
  // Goals
  intendedLevel?: string;
  intendedMajor?: string;
  targetCountries?: string[];
  targetIntake?: string;
  currentStage?: string;
  fundingNeed?: boolean;
}

export interface GapFixRecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
  resources: string[];
  timelineWeeks: number;
}

export interface GapFixResult {
  profileScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: GapFixRecommendation[];
  prioritySummary: string;
  generatedAt: string;
}

function assessProfileWeaknesses(req: GapFixRequest): {
  weaknesses: string[];
  strengths: string[];
  score: number;
} {
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  let score = 50;

  // GPA assessment
  if (req.gpa !== undefined && req.gpaScale) {
    const normalised = req.gpaScale === '4.0' ? req.gpa
      : req.gpaScale === '10' ? (req.gpa / 10) * 4
      : req.gpaScale === '5' ? (req.gpa / 5) * 4
      : req.gpa;
    if (normalised < 2.5) {
      weaknesses.push('GPA is significantly below competitive thresholds (< 2.5/4.0)');
      score -= 15;
    } else if (normalised < 3.0) {
      weaknesses.push('GPA is below competitive range for top programs (< 3.0/4.0)');
      score -= 8;
    } else if (normalised >= 3.5) {
      strengths.push(`Strong GPA: ${req.gpa}/${req.gpaScale}`);
      score += 10;
    } else {
      strengths.push(`Adequate GPA: ${req.gpa}/${req.gpaScale}`);
      score += 4;
    }
  } else {
    weaknesses.push('GPA not provided — required for most graduate applications');
    score -= 5;
  }

  // Backlogs
  if (req.backlogs && req.backlogs > 0) {
    weaknesses.push(`${req.backlogs} academic backlog(s) noted — may raise admissions concerns`);
    score -= req.backlogs > 3 ? 12 : 5;
  }

  // English test
  if (!req.englishTestType || !req.englishScore) {
    if (req.intendedLevel && req.intendedLevel !== 'BSC') {
      weaknesses.push('No English proficiency test score (IELTS/TOEFL) provided');
      score -= 10;
    }
  } else {
    const isStrong = (req.englishTestType === 'IELTS' && req.englishScore >= 7.0)
      || (req.englishTestType === 'TOEFL' && req.englishScore >= 95);
    if (isStrong) {
      strengths.push(`Strong English test: ${req.englishTestType} ${req.englishScore}`);
      score += 8;
    } else {
      weaknesses.push(`English test score is below competitive range (${req.englishTestType}: ${req.englishScore})`);
      score -= 5;
    }
  }

  // GRE/GMAT for grad programs
  if ((req.intendedLevel === 'MSC' || req.intendedLevel === 'PHD') && !req.gre && !req.gmat) {
    weaknesses.push('No GRE/GMAT score — many competitive programs require or prefer it');
    score -= 5;
  } else if (req.gre) {
    if (req.gre >= 320) {
      strengths.push(`Strong GRE score: ${req.gre}`);
      score += 8;
    } else if (req.gre < 300) {
      weaknesses.push(`GRE score is below competitive range (${req.gre} < 300)`);
      score -= 5;
    }
  }

  // Work experience
  const workMonths = req.workExperienceMonths ?? 0;
  if (workMonths === 0 && req.intendedLevel === 'MSC') {
    weaknesses.push('No work/research experience — competitive programs value practical experience');
    score -= 5;
  } else if (workMonths >= 12) {
    strengths.push(`Solid work experience: ${Math.floor(workMonths / 12)} year(s)`);
    score += 5;
  }

  // PhD with no research
  if (req.intendedLevel === 'PHD' && workMonths < 6) {
    weaknesses.push('Limited research/work experience for PhD applications — research background is critical');
    score -= 10;
  }

  // Funding need without strong profile
  if (req.fundingNeed && score < 60) {
    weaknesses.push('Funding is needed but profile competitiveness may limit scholarship options');
  }

  return { weaknesses, strengths, score: Math.min(100, Math.max(10, score)) };
}

export async function generateGapFix(req: GapFixRequest): Promise<GapFixResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
  const { weaknesses, strengths, score } = assessProfileWeaknesses(req);

  const profileSummary = [
    req.currentStage && `Current stage: ${req.currentStage}`,
    req.intendedLevel && `Target level: ${req.intendedLevel}`,
    req.intendedMajor && `Intended major: ${req.intendedMajor}`,
    req.targetCountries?.length && `Target countries: ${req.targetCountries.join(', ')}`,
    req.targetIntake && `Target intake: ${req.targetIntake}`,
    req.gpa && `GPA: ${req.gpa}/${req.gpaScale ?? '4.0'}`,
    req.backlogs && `Backlogs: ${req.backlogs}`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.gre && `GRE: ${req.gre}`,
    req.gmat && `GMAT: ${req.gmat}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.fundingNeed && 'Needs scholarship/funding',
  ].filter(Boolean).join('\n');

  const weaknessSummary = weaknesses.length > 0
    ? `Identified weaknesses:\n${weaknesses.map(w => `- ${w}`).join('\n')}`
    : 'No critical weaknesses detected.';

  const prompt = `You are an expert graduate admissions counselor helping a student strengthen their application profile.

Student Profile:
${profileSummary || 'Limited profile information provided.'}

${weaknessSummary}

Provide a structured gap analysis with CONCRETE, actionable recommendations. For each gap, provide specific resources (platform names, course names, certifications).

Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "category": "Academic Performance | English Proficiency | Standardized Tests | Research Experience | Technical Skills | Portfolio/Projects | Professional Experience | Publications | Soft Skills",
      "priority": "high | medium | low",
      "title": "Short title",
      "description": "2-3 sentences explaining the gap and its impact",
      "actions": ["specific action 1", "specific action 2", "specific action 3"],
      "resources": ["Resource name 1 (platform)", "Resource name 2 (course/cert)"],
      "timelineWeeks": 4
    }
  ],
  "prioritySummary": "2-3 sentence summary of the most important things to focus on given their goals and timeline"
}

Provide 3-6 recommendations. Focus on what's most impactful for their specific target (${req.intendedLevel ?? 'graduate'} in ${req.intendedMajor ?? 'their field'} in ${req.targetCountries?.join('/') ?? 'target country'}).
Return ONLY valid JSON. No markdown, no explanation.`;

  if (!apiKey) {
    return buildFallbackResult(req, score, weaknesses, strengths);
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
        temperature: 0.4,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) throw new Error(`LLM error: ${response.status}`);

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? '';
    if (!raw) throw new Error('Empty LLM response');

    const parsed = JSON.parse(raw) as { recommendations?: GapFixRecommendation[]; prioritySummary?: string };

    return {
      profileScore: score,
      strengths,
      weaknesses,
      recommendations: (parsed.recommendations ?? []).slice(0, 6),
      prioritySummary: parsed.prioritySummary ?? 'Focus on your highest-priority gaps first.',
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return buildFallbackResult(req, score, weaknesses, strengths);
  }
}

function buildFallbackResult(req: GapFixRequest, score: number, weaknesses: string[], strengths: string[]): GapFixResult {
  const recs: GapFixRecommendation[] = [];

  const gpa = req.gpa ? (req.gpaScale === '4.0' ? req.gpa : req.gpaScale === '10' ? (req.gpa / 10) * 4 : req.gpa) : null;
  if (gpa !== null && gpa < 3.0) {
    recs.push({
      category: 'Academic Performance',
      priority: 'high',
      title: 'Strengthen your academic record',
      description: 'Your GPA is below competitive thresholds for most graduate programs. Consider retaking weak courses, completing additional coursework, or applying to programs with more flexible admission bands.',
      actions: [
        'Retake your lowest-scoring courses to replace grades where allowed',
        'Enroll in advanced online courses in your field to demonstrate capability',
        'Write a strong GPA explanation in your SOP if improvement is not possible',
      ],
      resources: ['Coursera Specializations', 'edX MicroMasters', 'MIT OpenCourseWare'],
      timelineWeeks: 12,
    });
  }

  if (!req.englishTestType || !req.englishScore) {
    recs.push({
      category: 'English Proficiency',
      priority: 'high',
      title: 'Take an English proficiency test',
      description: 'IELTS or TOEFL scores are required by most graduate programs in English-speaking countries and increasingly by programs in Germany, Netherlands, and other European destinations.',
      actions: [
        'Register for IELTS Academic (target 7.0+) or TOEFL iBT (target 95+)',
        'Complete a 4–8 week structured preparation course',
        'Practice with official past papers and timed mock tests',
      ],
      resources: ['IELTS.org official prep', 'ETS TOEFL prep', 'Magoosh IELTS/TOEFL', 'British Council online courses'],
      timelineWeeks: 8,
    });
  }

  if ((req.intendedLevel === 'MSC' || req.intendedLevel === 'PHD') && !req.gre && !req.gmat) {
    recs.push({
      category: 'Standardized Tests',
      priority: 'medium',
      title: 'Consider taking the GRE',
      description: 'A strong GRE score (320+) significantly improves competitiveness for top MS/PhD programs, especially in the US and Canada. Some programs require it; others use it as a differentiator.',
      actions: [
        'Review GRE requirements for your specific target programs',
        'Complete a structured 6–8 week GRE preparation plan',
        'Target Verbal ≥ 155, Quant ≥ 165 for STEM fields',
      ],
      resources: ['Magoosh GRE', 'Manhattan Prep GRE', 'ETS official GRE prep', 'Khan Academy for math'],
      timelineWeeks: 8,
    });
  }

  if ((req.workExperienceMonths ?? 0) < 6 && req.intendedLevel === 'PHD') {
    recs.push({
      category: 'Research Experience',
      priority: 'high',
      title: 'Build research credentials before applying',
      description: 'PhD programs expect applicants to demonstrate research ability. Without research experience, your application will be at a significant disadvantage regardless of other profile strengths.',
      actions: [
        'Apply for a research assistant position at your current or nearby institution',
        'Contact professors working in your area of interest for volunteer research opportunities',
        'Complete a replication study or mini-research project and document it on GitHub/portfolio',
        'Aim to co-author or contribute to a conference paper within 6 months',
      ],
      resources: ['ResearchGate', 'Academia.edu', 'GitHub for open research', 'Google Scholar to find target professors'],
      timelineWeeks: 16,
    });
  }

  if (req.intendedMajor?.toLowerCase().includes('computer') || req.intendedMajor?.toLowerCase().includes('data') || req.intendedMajor?.toLowerCase().includes('ai')) {
    recs.push({
      category: 'Technical Skills',
      priority: 'medium',
      title: 'Build a technical project portfolio',
      description: 'A strong GitHub portfolio with 2–3 relevant projects significantly strengthens CS/Data Science/AI applications. Admissions committees and potential advisors actively review GitHub profiles.',
      actions: [
        'Build and document 2–3 original projects in your target field',
        'Contribute to an open-source project in your research area',
        'Complete a Kaggle competition and write up your approach',
        'Deploy at least one project with a live demo link',
      ],
      resources: ['GitHub', 'Kaggle', 'Hugging Face for AI/ML', 'fast.ai courses', 'Papers with Code'],
      timelineWeeks: 10,
    });
  }

  recs.push({
    category: 'Professional Experience',
    priority: 'medium',
    title: 'Strengthen your resume with relevant experience',
    description: 'Internships, part-time work, or project-based experience in your intended field demonstrates practical competence and makes your application narrative more compelling.',
    actions: [
      'Apply for relevant internships or co-op positions in your field',
      'Volunteer for NGOs, research labs, or companies in your sector',
      'Document all relevant projects and achievements in your CV/resume',
    ],
    resources: ['LinkedIn Jobs', 'Internshala', 'Indeed', 'Glassdoor', 'University career center'],
    timelineWeeks: 12,
  });

  return {
    profileScore: score,
    strengths,
    weaknesses,
    recommendations: recs.slice(0, 5),
    prioritySummary: weaknesses.length > 0
      ? `Focus on: ${weaknesses.slice(0, 2).join('; ')}. Your profile score is ${score}/100 — addressing high-priority gaps can significantly improve your competitiveness.`
      : `Your profile looks strong with a score of ${score}/100. Focus on rounding out the medium-priority areas to maximize your chances.`,
    generatedAt: new Date().toISOString(),
  };
}
