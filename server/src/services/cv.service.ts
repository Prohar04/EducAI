/**
 * CV Service — LLM-powered academic CV generation.
 * Supports 10 templates and rich user-provided profile data.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export type CvTemplate =
  | 'minimal-academic'
  | 'research-focused'
  | 'modern-professional'
  | 'scholarship-focused'
  | 'international-student'
  | 'technical-engineering'
  | 'business-management'
  | 'clean-classic'
  | 'compact-one-page'
  | 'phd-research';

export interface CvRequest {
  // Identity
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  // Target
  targetDegree?: string;
  targetCountry?: string;
  targetUniversity?: string;
  targetProgram?: string;
  // Academic
  summary?: string;
  currentDegree?: string;
  currentInstitution?: string;
  majorOrTrack?: string;
  gpa?: number;
  gpaScale?: string;
  graduationYear?: number;
  thesisOrResearch?: string;
  publications?: string;
  // Tests
  englishTestType?: string;
  englishScore?: number;
  gre?: number;
  gmat?: number;
  // Experience
  workExperience?: string;
  workExperienceMonths?: number;
  internships?: string;
  // Skills
  technicalSkills?: string;
  softSkills?: string;
  // Extras
  projects?: string;
  certifications?: string;
  awards?: string;
  extracurriculars?: string;
  volunteering?: string;
  references?: string;
  // Legacy
  intendedLevel?: string;
  intendedMajor?: string;
  highlights?: string;
  // Template
  cvTemplate: CvTemplate;
}

export interface CvResult {
  cv: string;
  template: CvTemplate;
  sections: string[];
}

const TEMPLATE_CONFIG: Record<CvTemplate, { label: string; instruction: string; sections: string[] }> = {
  'minimal-academic': {
    label: 'Minimal Academic',
    instruction: 'Create a clean, minimal academic CV. Use: Education, Research Experience, Technical Skills, Test Scores, Awards. No decorative elements. Tight spacing. Prioritize academic credentials.',
    sections: ['Education', 'Research Experience', 'Technical Skills', 'Test Scores', 'Awards'],
  },
  'research-focused': {
    label: 'Research Focused',
    instruction: 'Create a research-first CV. Lead with Research Experience and Publications. Sections: Research Experience, Publications & Presentations, Projects, Technical Skills, Education, Awards.',
    sections: ['Research Experience', 'Publications', 'Projects', 'Technical Skills', 'Education'],
  },
  'modern-professional': {
    label: 'Modern Professional',
    instruction: 'Create a modern professional CV with a brief profile summary at the top. Sections: Professional Summary, Education, Work Experience, Projects, Skills, Certifications.',
    sections: ['Summary', 'Education', 'Work Experience', 'Projects', 'Skills', 'Certifications'],
  },
  'scholarship-focused': {
    label: 'Scholarship Focused',
    instruction: 'Create a scholarship-oriented CV emphasizing merit, leadership, and community impact. Lead with Achievements and Awards. Sections: Profile, Academic Excellence, Awards & Honours, Leadership, Research, Community Service, Skills.',
    sections: ['Profile', 'Academic Excellence', 'Awards', 'Leadership', 'Research', 'Community Service'],
  },
  'international-student': {
    label: 'International Student Profile',
    instruction: 'Create an international student CV. Include language proficiency, test scores prominently, and study/work abroad experience. Sections: Profile, Education, Language Proficiency & Tests, Research/Projects, Work Experience, Skills.',
    sections: ['Profile', 'Education', 'Language & Tests', 'Research/Projects', 'Work Experience', 'Skills'],
  },
  'technical-engineering': {
    label: 'Technical / Engineering',
    instruction: 'Create a technical CV for engineering/CS applicants. Lead with Technical Skills and Projects. Sections: Technical Skills, Projects & Open Source, Work/Internship Experience, Education, Certifications, Publications.',
    sections: ['Technical Skills', 'Projects', 'Work Experience', 'Education', 'Certifications'],
  },
  'business-management': {
    label: 'Business / Management',
    instruction: 'Create a business-oriented CV emphasizing leadership, strategy, and impact metrics. Sections: Executive Summary, Education, Professional Experience, Leadership & Activities, Skills, Certifications.',
    sections: ['Executive Summary', 'Education', 'Professional Experience', 'Leadership', 'Skills'],
  },
  'clean-classic': {
    label: 'Clean Classic',
    instruction: 'Create a classic chronological CV, clean and universally readable. Sections: Contact, Objective, Education, Experience, Skills, Awards, References.',
    sections: ['Objective', 'Education', 'Experience', 'Skills', 'Awards'],
  },
  'compact-one-page': {
    label: 'Compact One-Page',
    instruction: 'Create a compact one-page CV. Every section must be concise. Use bullet points sparingly. Sections: Summary, Education, Key Experience, Core Skills, Selected Achievements. Keep it under 500 words.',
    sections: ['Summary', 'Education', 'Key Experience', 'Core Skills', 'Selected Achievements'],
  },
  'phd-research': {
    label: 'PhD Research Proposal',
    instruction: 'Create a PhD application CV. Lead with Research Interests and Research Experience. Include Publications, Conference Presentations if any. Sections: Research Interests, Education, Research Experience, Publications & Talks, Technical Skills, Fellowships & Awards.',
    sections: ['Research Interests', 'Education', 'Research Experience', 'Publications', 'Skills', 'Awards'],
  },
};

export async function generateCv(req: CvRequest): Promise<CvResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  const templateConfig = TEMPLATE_CONFIG[req.cvTemplate] ?? TEMPLATE_CONFIG['minimal-academic'];

  const profileLines = [
    req.name && `Full Name: ${req.name}`,
    req.email && `Email: ${req.email}`,
    req.phone && `Phone: ${req.phone}`,
    req.linkedin && `LinkedIn: ${req.linkedin}`,
    req.github && `GitHub/Portfolio: ${req.github}`,
    req.summary && `Profile Summary: ${req.summary}`,
    '--- Academic Background ---',
    req.currentDegree && `Current degree: ${req.currentDegree}`,
    req.currentInstitution && `Institution: ${req.currentInstitution}`,
    req.majorOrTrack && `Major/Track: ${req.majorOrTrack}`,
    req.gpa && `GPA: ${req.gpa}${req.gpaScale ? `/${req.gpaScale}` : ''}`,
    req.graduationYear && `Expected graduation: ${req.graduationYear}`,
    req.thesisOrResearch && `Thesis/Research: ${req.thesisOrResearch}`,
    req.publications && `Publications: ${req.publications}`,
    '--- Target Application ---',
    req.targetDegree && `Target degree: ${req.targetDegree}`,
    req.targetProgram && `Target program: ${req.targetProgram}`,
    req.targetUniversity && `Target university: ${req.targetUniversity}`,
    req.targetCountry && `Target country: ${req.targetCountry}`,
    '--- Tests ---',
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.gre && `GRE: ${req.gre}`,
    req.gmat && `GMAT: ${req.gmat}`,
    '--- Experience ---',
    req.workExperienceMonths && `Work experience: ${Math.floor(req.workExperienceMonths / 12)}y ${req.workExperienceMonths % 12}m`,
    req.workExperience && `Work Experience Details:\n${req.workExperience}`,
    req.internships && `Internships:\n${req.internships}`,
    '--- Skills ---',
    req.technicalSkills && `Technical Skills: ${req.technicalSkills}`,
    req.softSkills && `Soft Skills: ${req.softSkills}`,
    '--- Extras ---',
    req.projects && `Projects:\n${req.projects}`,
    req.certifications && `Certifications: ${req.certifications}`,
    req.awards && `Awards/Honours: ${req.awards}`,
    req.extracurriculars && `Extracurriculars: ${req.extracurriculars}`,
    req.volunteering && `Volunteering: ${req.volunteering}`,
    req.references && `References: ${req.references}`,
    req.highlights && `Additional highlights:\n${req.highlights}`,
  ].filter(Boolean).join('\n');

  const prompt = `You are an expert academic CV writer specializing in graduate school and scholarship applications.

Template: ${templateConfig.label}
${templateConfig.instruction}

Student Profile:
${profileLines || 'Limited profile provided — create a template CV with clear [PLACEHOLDER] markers.'}

Instructions:
- Write a complete, ATS-friendly CV in plain text format.
- Use clear section headers in ALL CAPS followed by a line of dashes.
- Use consistent spacing and bullet points where appropriate.
- Where specific data is not provided, use [PLACEHOLDER] markers.
- Adapt content emphasis to match the template type.
- Do NOT invent specific achievements, publications, or institutions that were not mentioned.

Write ONLY the CV text. No commentary, no explanations, no markdown.`;

  if (!apiKey) {
    const header = [
      req.name?.toUpperCase() ?? 'YOUR NAME',
      req.email ?? 'your.email@example.com',
      req.phone ?? '',
      req.linkedin ?? '',
    ].filter(Boolean).join(' | ');

    return {
      cv: `[Configure OPENAI_API_KEY or OPENROUTER_API_KEY to enable AI-generated CV]\n\n${header}\n\nEDUCATION\n----------\n${req.currentDegree ?? '[Degree]'} in ${req.majorOrTrack ?? '[Major]'}\n${req.currentInstitution ?? '[Institution]'}\n\n[Complete your profile and configure an AI key for a full generated CV.]`,
      template: req.cvTemplate,
      sections: templateConfig.sections,
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
      temperature: 0.3,
      max_tokens: 2000,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`LLM error: ${response.status}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const cv = data?.choices?.[0]?.message?.content?.trim() ?? '';

  if (!cv) throw new Error('Empty LLM response');

  return { cv, template: req.cvTemplate, sections: templateConfig.sections };
}
