/**
 * Resume Service — LLM-powered industry resume generation.
 * 6 job-market templates targeting ATS, tech companies, startups, and executive roles.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export type ResumeTemplate =
  | 'ats-clean'
  | 'google-faang'
  | 'startup-tech'
  | 'executive-professional'
  | 'data-science'
  | 'consulting-finance';

export interface ResumeRequest {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
  targetRole?: string;
  targetCompany?: string;
  targetIndustry?: string;
  workExperience?: string;
  internships?: string;
  education?: string;
  technicalSkills?: string;
  softSkills?: string;
  projects?: string;
  certifications?: string;
  achievements?: string;
  languages?: string;
  volunteering?: string;
  highlights?: string;
  resumeTemplate: ResumeTemplate;
}

export interface ResumeResult {
  resume: string;
  template: ResumeTemplate;
  sections: string[];
}

const TEMPLATE_CONFIG: Record<ResumeTemplate, { label: string; instruction: string; sections: string[] }> = {
  'ats-clean': {
    label: 'ATS-Friendly Clean',
    instruction: `Create a clean ATS-optimised resume. Use plain text section headers (no icons or decorations). Order: Contact, Professional Summary (3 lines max), Work Experience (reverse chronological, quantified bullet points with numbers/percentages), Education, Technical Skills (comma-separated lists), Certifications. Keep to 1–2 pages. Use action verbs. Quantify every achievement where possible.`,
    sections: ['Professional Summary', 'Work Experience', 'Education', 'Technical Skills', 'Certifications'],
  },
  'google-faang': {
    label: 'FAANG / Big Tech',
    instruction: `Create a Big Tech resume following Google/Meta/Amazon conventions. Sections: Contact, Summary (2–3 lines, impact-focused), Experience (STAR-format bullets: Situation→Task→Action→Result with metrics), Education (GPA if above 3.5), Technical Skills (languages, frameworks, tools, cloud), Projects (with GitHub/links if available), Publications (if any). Every bullet must show impact: "Led X, achieved Y by doing Z." Keep crisp.`,
    sections: ['Summary', 'Experience', 'Education', 'Technical Skills', 'Projects'],
  },
  'startup-tech': {
    label: 'Startup / Tech',
    instruction: `Create a modern startup-style resume. Bold, action-oriented. Sections: Contact (include portfolio/GitHub prominently), Headline (one-line role + value prop), Experience (ownership, speed, breadth of impact), Side Projects & Open Source, Education, Skills & Stack. Show initiative and range. One page preferred. Use conversational yet professional tone.`,
    sections: ['Headline', 'Experience', 'Side Projects', 'Skills & Stack', 'Education'],
  },
  'executive-professional': {
    label: 'Executive / Senior',
    instruction: `Create an executive-level resume for senior professionals. Sections: Contact, Executive Profile (4–5 lines highlighting leadership philosophy and key impact areas), Core Competencies (a 3-column grid of 9–12 skills), Career History (outcomes-based, strategic scope, team sizes, budgets, P&L), Board/Advisory Roles, Education & Credentials. Tone: authoritative, strategic, results-driven. 2 pages.`,
    sections: ['Executive Profile', 'Core Competencies', 'Career History', 'Education & Credentials'],
  },
  'data-science': {
    label: 'Data Science / ML',
    instruction: `Create a Data Science/ML resume. Sections: Contact, Summary (highlight ML stack, domain, and scale of data worked with), Technical Skills (ML frameworks, languages, tools, cloud/infra — grouped), Experience (focus on models shipped, data pipelines built, business impact of predictions), Projects & Research (Kaggle, papers, notebooks), Education (GPA, relevant coursework, thesis if any), Publications/Talks. Be specific about model types and metrics.`,
    sections: ['Summary', 'Technical Skills', 'Experience', 'Projects & Research', 'Education'],
  },
  'consulting-finance': {
    label: 'Consulting / Finance',
    instruction: `Create a consulting/finance resume following McKinsey/Goldman Sachs format conventions. Crisp, structured, no wasted space. Sections: Contact, Education (GPA, honours — goes FIRST in consulting resumes), Experience (bullet points showing structured problem-solving, quantified impact, client context), Leadership & Activities (clubs, societies, competitions), Skills (languages, software, certifications). Every bullet: Action + Method + Result. Formal tone. 1 page.`,
    sections: ['Education', 'Experience', 'Leadership & Activities', 'Skills'],
  },
};

export async function generateResume(req: ResumeRequest): Promise<ResumeResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  const config = TEMPLATE_CONFIG[req.resumeTemplate] ?? TEMPLATE_CONFIG['ats-clean'];

  const profileLines = [
    req.name && `Full Name: ${req.name}`,
    req.email && `Email: ${req.email}`,
    req.phone && `Phone: ${req.phone}`,
    req.location && `Location: ${req.location}`,
    req.linkedin && `LinkedIn: ${req.linkedin}`,
    req.github && `GitHub: ${req.github}`,
    req.portfolio && `Portfolio: ${req.portfolio}`,
    req.targetRole && `Target Role: ${req.targetRole}`,
    req.targetCompany && `Target Company: ${req.targetCompany}`,
    req.targetIndustry && `Target Industry: ${req.targetIndustry}`,
    req.summary && `Professional Summary Notes: ${req.summary}`,
    req.workExperience && `Work Experience: ${req.workExperience}`,
    req.internships && `Internships: ${req.internships}`,
    req.education && `Education: ${req.education}`,
    req.technicalSkills && `Technical Skills: ${req.technicalSkills}`,
    req.softSkills && `Soft Skills: ${req.softSkills}`,
    req.projects && `Projects: ${req.projects}`,
    req.certifications && `Certifications: ${req.certifications}`,
    req.achievements && `Key Achievements: ${req.achievements}`,
    req.languages && `Languages: ${req.languages}`,
    req.volunteering && `Volunteering: ${req.volunteering}`,
    req.highlights && `Additional Highlights: ${req.highlights}`,
  ].filter(Boolean).join('\n');

  const systemPrompt = `You are a professional resume writer specialising in the ${config.label} format. You write resumes that get interviews. Use only the information provided — never invent facts, companies, degrees, or metrics. If data is missing for a field, omit that field rather than fabricating. Output ONLY the resume text — no commentary, no markdown code fences, no explanations.`;

  const userPrompt = `${config.instruction}

CANDIDATE INFORMATION:
${profileLines}

Write the complete resume now. Use the exact section order specified above. Use ALL-CAPS for section headers. Use plain bullet points (• or -). Do not use markdown formatting. Output the resume only.`;

  if (!apiKey) {
    throw new Error('No LLM API key configured (OPENAI_API_KEY or OPENROUTER_API_KEY)');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1800,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`LLM API error ${response.status}: ${err}`);
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[];
  };

  const resumeText = data.choices[0]?.message?.content?.trim() ?? '';
  if (!resumeText) throw new Error('LLM returned empty response');

  return {
    resume: resumeText,
    template: req.resumeTemplate,
    sections: config.sections,
  };
}
