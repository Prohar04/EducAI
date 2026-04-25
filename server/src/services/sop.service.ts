/**
 * SOP Service — LLM-powered Statement of Purpose generation.
 * Supports 10 templates and rich user-provided context.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export type SopTemplate =
  | 'formal-academic'
  | 'research-focused'
  | 'scholarship-focused'
  | 'personal-story'
  | 'professional-career'
  | 'technical-engineering'
  | 'business-management'
  | 'compact-direct'
  | 'highly-persuasive'
  | 'phd-proposal';

// Legacy type aliases kept for backward compatibility
export type SopTone = 'formal' | 'research' | 'personal';
export type SopType = 'general' | 'scholarship' | 'research';

export interface SopRequest {
  // Profile context
  name?: string;
  currentDegree?: string;
  gpa?: number;
  gpaScale?: string;
  majorOrTrack?: string;
  intendedMajor?: string;
  intendedLevel?: string;
  workExperienceMonths?: number;
  englishTestType?: string;
  englishScore?: number;
  // Target
  targetProgram?: string;
  targetUniversity?: string;
  targetCountry?: string;
  targetIntake?: string;
  degreeLevel?: string;
  // Rich user-provided fields
  sopPurpose?: string;
  academicBackground?: string;
  motivation?: string;
  whySubject?: string;
  whyUniversity?: string;
  whyCountry?: string;
  careerGoals?: string;
  researchInterests?: string;
  achievements?: string;
  workExperience?: string;
  projects?: string;
  challengesOvercome?: string;
  scholarshipAngle?: string;
  // Options
  sopTemplate: SopTemplate;
  highlights?: string;
  // Legacy
  tone?: SopTone;
  sopType?: SopType;
}

export interface SopResult {
  sop: string;
  wordCount: number;
  template: SopTemplate;
  sopType: SopType;
}

const TEMPLATE_CONFIG: Record<SopTemplate, { label: string; instruction: string; structure: string[] }> = {
  'formal-academic': {
    label: 'Formal Academic',
    instruction: 'Write in formal, professional academic prose. Use precise language. Avoid contractions and informal phrasing.',
    structure: ['Opening motivation', 'Academic background', 'Why this program', 'Research/career goals', 'Closing statement'],
  },
  'research-focused': {
    label: 'Research Focused',
    instruction: 'Emphasize intellectual curiosity and research trajectory. Discuss specific research questions, methodologies, and how this program advances the research agenda.',
    structure: ['Research question/problem', 'Academic and research background', 'Alignment with faculty/program', 'Proposed research direction', 'Long-term impact'],
  },
  'scholarship-focused': {
    label: 'Scholarship Focused',
    instruction: 'Emphasize merit, leadership, community impact, and future contribution. Quantify achievements where possible. Link academic excellence to societal impact.',
    structure: ['Opening with strongest achievement', 'Academic excellence', 'Leadership and impact', 'Why this scholarship/program', 'Future contribution to society'],
  },
  'personal-story': {
    label: 'Personal Story Driven',
    instruction: 'Use a compelling personal narrative. Open with a defining moment or challenge. Weave the story through academic and professional growth. Keep it authentic and emotionally resonant.',
    structure: ['Defining moment/hook', 'Journey and growth', 'How it shaped academic goals', 'Why this program fits', 'Vision for the future'],
  },
  'professional-career': {
    label: 'Professional / Career Oriented',
    instruction: 'Focus on career trajectory and professional impact. Connect work experience to academic goals. Show clear professional motivation for graduate study.',
    structure: ['Professional background', 'Career motivation for graduate study', 'Academic qualifications', 'Program alignment with career goals', 'Future professional impact'],
  },
  'technical-engineering': {
    label: 'Technical / Engineering',
    instruction: 'Emphasize technical skills, engineering projects, and quantified results. Mention specific tools, methodologies, and technical problems solved. Keep it crisp and evidence-driven.',
    structure: ['Technical background summary', 'Key engineering projects', 'Gaps that graduate study fills', 'Why this specific program/lab', 'Technical career goals'],
  },
  'business-management': {
    label: 'Business / Management',
    instruction: 'Focus on leadership, strategic thinking, and business impact. Use metrics and business outcomes where possible. Emphasize management potential and business vision.',
    structure: ['Leadership profile', 'Business experience and impact', 'Why MBA/management education now', 'Program-specific fit', 'Post-degree business vision'],
  },
  'compact-direct': {
    label: 'Compact & Direct',
    instruction: 'Write a concise, direct SOP under 500 words. One strong sentence per idea. No filler. Every sentence must earn its place. No lengthy background — jump to the point.',
    structure: ['One-sentence motivation hook', 'Brief academic/work background', 'Why this program specifically', 'Concrete goals', 'One-line closing'],
  },
  'highly-persuasive': {
    label: 'Highly Persuasive',
    instruction: 'Write a highly persuasive SOP that builds a compelling case. Use rhetorical techniques — build from problem to solution, show unique perspective, use vivid examples, end with a memorable closing.',
    structure: ['Compelling opening claim', 'Evidence and credibility', 'Unique perspective/value-add', 'Program as the necessary step', 'Memorable, forward-looking close'],
  },
  'phd-proposal': {
    label: 'PhD Research Proposal Tone',
    instruction: 'Write in academic proposal style. State a clear research problem, demonstrate familiarity with the literature, describe planned methodology, and explain how the supervisors/program are uniquely positioned to support this work.',
    structure: ['Research problem statement', 'Literature positioning', 'Prior research background', 'Proposed research direction/methodology', 'Fit with program/supervisor', 'Contribution to field'],
  },
};

export async function generateSop(req: SopRequest): Promise<SopResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  const templateConfig = TEMPLATE_CONFIG[req.sopTemplate] ?? TEMPLATE_CONFIG['formal-academic'];

  // Derive backward-compat sopType
  const sopType: SopType = req.sopType ?? (
    req.sopTemplate === 'scholarship-focused' ? 'scholarship'
    : req.sopTemplate === 'research-focused' || req.sopTemplate === 'phd-proposal' ? 'research'
    : 'general'
  );

  const profileLines = [
    req.name && `Name: ${req.name}`,
    req.currentDegree && `Current degree: ${req.currentDegree}`,
    req.majorOrTrack && `Current major: ${req.majorOrTrack}`,
    req.gpa && `GPA: ${req.gpa}${req.gpaScale ? `/${req.gpaScale}` : ''}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.intendedMajor && `Intended major: ${req.intendedMajor}`,
    req.intendedLevel && `Target level: ${req.intendedLevel}`,
  ].filter(Boolean).join('\n');

  const targetLines = [
    req.targetProgram && `Target program: ${req.targetProgram}`,
    req.targetUniversity && `Target university: ${req.targetUniversity}`,
    req.targetCountry && `Target country: ${req.targetCountry}`,
    req.targetIntake && `Target intake: ${req.targetIntake}`,
    req.degreeLevel && `Degree level: ${req.degreeLevel}`,
  ].filter(Boolean).join('\n');

  const contextLines = [
    req.sopPurpose && `SOP purpose/angle: ${req.sopPurpose}`,
    req.academicBackground && `Academic background: ${req.academicBackground}`,
    req.motivation && `Core motivation: ${req.motivation}`,
    req.whySubject && `Why this subject: ${req.whySubject}`,
    req.whyUniversity && `Why this university: ${req.whyUniversity}`,
    req.whyCountry && `Why this country: ${req.whyCountry}`,
    req.careerGoals && `Career goals: ${req.careerGoals}`,
    req.researchInterests && `Research interests: ${req.researchInterests}`,
    req.achievements && `Key achievements: ${req.achievements}`,
    req.workExperience && `Work/internship experience: ${req.workExperience}`,
    req.projects && `Projects: ${req.projects}`,
    req.challengesOvercome && `Challenges overcome: ${req.challengesOvercome}`,
    req.scholarshipAngle && `Scholarship angle: ${req.scholarshipAngle}`,
    req.highlights && `Additional highlights: ${req.highlights}`,
  ].filter(Boolean).join('\n');

  const wordTarget = req.sopTemplate === 'compact-direct' ? '400-500 words' : '600-850 words';

  const prompt = `You are an expert academic writing coach specializing in graduate admissions.

Template: ${templateConfig.label}
Style instruction: ${templateConfig.instruction}

Suggested structure:
${templateConfig.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

--- Student Profile ---
${profileLines || 'Profile not fully provided.'}

--- Application Target ---
${targetLines || 'Target not specified — write a general SOP.'}

--- Student-Provided Context ---
${contextLines || 'No additional context provided.'}

Write a complete Statement of Purpose (${wordTarget}). Follow the template style strictly. Make it genuinely personalized using the provided details. Do NOT invent specific institutions, professors, awards, or experiences that were not mentioned.

Write ONLY the SOP text. No headings, no metadata, no word count markers. Just the SOP.`;

  if (!apiKey) {
    return {
      sop: `[Configure OPENAI_API_KEY or OPENROUTER_API_KEY to enable AI-generated SOP]\n\nStatement of Purpose\n\nI am writing to express my strong interest in the ${req.intendedLevel ?? 'graduate'} program in ${req.intendedMajor ?? req.majorOrTrack ?? 'the selected field'} at ${req.targetUniversity ?? 'your esteemed institution'}.\n\n[Full SOP will be generated once an AI key is configured.]`,
      wordCount: 0,
      template: req.sopTemplate,
      sopType,
    };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.65,
      max_tokens: 1400,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`LLM error: ${response.status}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const sop = data?.choices?.[0]?.message?.content?.trim() ?? '';

  if (!sop) throw new Error('Empty LLM response');

  return {
    sop,
    wordCount: sop.split(/\s+/).length,
    template: req.sopTemplate,
    sopType,
  };
}
