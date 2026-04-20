/**
 * CV Service — LLM-powered academic CV generation.
 * Outputs clean ATS-friendly plain text suitable for copy/paste.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'; // fallback

export interface CvRequest {
  name?: string;
  email?: string;
  currentDegree?: string;
  currentInstitution?: string;
  majorOrTrack?: string;
  gpa?: number;
  gpaScale?: string;
  graduationYear?: number;
  englishTestType?: string;
  englishScore?: number;
  gre?: number;
  gmat?: number;
  workExperienceMonths?: number;
  intendedLevel?: string;
  intendedMajor?: string;
  targetCountry?: string;
  highlights?: string;
  cvStyle: 'academic' | 'research' | 'industry';
}

export interface CvResult {
  cv: string;
  style: string;
  sections: string[];
}

export async function generateCv(req: CvRequest): Promise<CvResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  const styleInstructions: Record<string, string> = {
    academic: 'Format as an academic CV with sections: Education, Research Experience, Publications (if any), Skills, Test Scores, Awards.',
    research: 'Format as a research-focused CV emphasizing: Research Experience, Publications, Projects, Technical Skills, Education.',
    industry: 'Format as an industry-ready ATS-optimized CV with: Summary, Education, Experience, Technical Skills, Certifications.',
  };

  const profile = [
    req.name && `Full Name: ${req.name}`,
    req.email && `Email: ${req.email}`,
    req.currentDegree && `Current degree: ${req.currentDegree}`,
    req.currentInstitution && `Institution: ${req.currentInstitution}`,
    req.majorOrTrack && `Major/Track: ${req.majorOrTrack}`,
    req.gpa && `GPA: ${req.gpa}${req.gpaScale ? `/${req.gpaScale}` : ''}`,
    req.graduationYear && `Expected graduation: ${req.graduationYear}`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.gre && `GRE: ${req.gre}`,
    req.gmat && `GMAT: ${req.gmat}`,
    req.workExperienceMonths && `Work experience: ${Math.floor(req.workExperienceMonths / 12)} years ${req.workExperienceMonths % 12} months`,
    req.intendedLevel && `Target level: ${req.intendedLevel}`,
    req.intendedMajor && `Intended major: ${req.intendedMajor}`,
    req.targetCountry && `Target country: ${req.targetCountry}`,
  ].filter(Boolean).join('\n');

  const prompt = `You are an expert academic CV writer specializing in graduate school applications.

${styleInstructions[req.cvStyle]}

Student Profile:
${profile || 'Limited profile — write a template CV with clear placeholders.'}

${req.highlights ? `Additional details to include:\n${req.highlights}` : ''}

Write a complete, ATS-friendly CV in plain text format. Use clear section headers in ALL CAPS. Use standard formatting with consistent spacing. Include realistic placeholder content where specific details are missing (mark placeholders with [brackets]).

Write ONLY the CV text. No commentary, no explanations.`;

  const sections = req.cvStyle === 'academic'
    ? ['Education', 'Research Experience', 'Skills', 'Test Scores', 'Awards']
    : req.cvStyle === 'research'
    ? ['Research Experience', 'Publications', 'Projects', 'Technical Skills', 'Education']
    : ['Summary', 'Education', 'Experience', 'Technical Skills', 'Certifications'];

  if (!apiKey) {
    return {
      cv: `[Configure OPENAI_API_KEY to enable AI-generated CV]\n\n${req.name?.toUpperCase() ?? 'YOUR NAME'}\n${req.email ?? 'your.email@example.com'}\n\nEDUCATION\n${req.currentDegree ?? 'B.Sc.'} in ${req.majorOrTrack ?? req.intendedMajor ?? '[Major]'}\n${req.currentInstitution ?? '[Institution]'}\n\n[Full CV will be generated once the AI key is configured.]`,
      style: req.cvStyle,
      sections,
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
      temperature: 0.4,
      max_tokens: 1500,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`LLM error: ${response.status}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const cv = data?.choices?.[0]?.message?.content?.trim() ?? '';

  if (!cv) throw new Error('Empty LLM response');

  return { cv, style: req.cvStyle, sections };
}
