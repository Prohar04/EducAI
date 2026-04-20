/**
 * SOP Service — LLM-powered Statement of Purpose generation.
 * Calls OpenRouter directly (same pattern as search.service.ts).
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'; // fallback

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
  // Target context
  targetProgram?: string;
  targetUniversity?: string;
  targetCountry?: string;
  targetIntake?: string;
  // SOP options
  tone: SopTone;
  sopType: SopType;
  highlights?: string; // user-provided talking points
}

export interface SopResult {
  sop: string;
  wordCount: number;
  tone: SopTone;
  sopType: SopType;
}

export async function generateSop(req: SopRequest): Promise<SopResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  const toneInstructions: Record<SopTone, string> = {
    formal: 'Use a formal, professional academic tone. Avoid colloquialisms.',
    research: 'Use a research-focused tone. Emphasize intellectual curiosity, research experiences, and academic contributions.',
    personal: 'Use a personal, authentic tone. Balance professional achievements with genuine motivation and personal story.',
  };

  const typeInstructions: Record<SopType, string> = {
    general: 'Write a general Statement of Purpose for graduate program admission.',
    scholarship: 'Write a Statement of Purpose tailored for scholarship applications. Emphasize merit, impact, and future contribution.',
    research: 'Write a research-focused Statement of Purpose. Emphasize research interests, methodology experience, and academic trajectory.',
  };

  const profile = [
    req.currentDegree && `Current degree: ${req.currentDegree}`,
    req.majorOrTrack && `Current major/track: ${req.majorOrTrack}`,
    req.gpa && `GPA: ${req.gpa}${req.gpaScale ? `/${req.gpaScale}` : ''}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.intendedMajor && `Intended major: ${req.intendedMajor}`,
    req.intendedLevel && `Target level: ${req.intendedLevel}`,
  ].filter(Boolean).join('\n');

  const target = [
    req.targetProgram && `Target program: ${req.targetProgram}`,
    req.targetUniversity && `Target university: ${req.targetUniversity}`,
    req.targetCountry && `Target country: ${req.targetCountry}`,
    req.targetIntake && `Target intake: ${req.targetIntake}`,
  ].filter(Boolean).join('\n');

  const prompt = `You are an expert academic writing coach specializing in graduate admissions.

${typeInstructions[req.sopType]}
${toneInstructions[req.tone]}

Student Profile:
${profile || 'Profile not provided — write a compelling general SOP.'}

${target ? `Application Target:\n${target}` : ''}

${req.highlights ? `Key points to include:\n${req.highlights}` : ''}

Write a complete Statement of Purpose (approximately 600-800 words). Structure it as:
1. Opening hook / motivation
2. Academic background and relevant experience
3. Why this specific program/university/country
4. Future goals and how this program aligns
5. Closing statement

Write ONLY the SOP text. No metadata, no word count, no headings. Just the full SOP text.`;

  if (!apiKey) {
    // Fallback when no API key — return structured placeholder
    return {
      sop: `[Configure OPENAI_API_KEY to enable AI-generated SOP]\n\nStatement of Purpose\n\nI am writing to express my strong interest in the ${req.intendedLevel ?? 'graduate'} program in ${req.intendedMajor ?? req.majorOrTrack ?? 'the selected field'} at ${req.targetUniversity ?? 'your esteemed institution'}.\n\n[Full SOP will be generated once the AI key is configured.]`,
      wordCount: 0,
      tone: req.tone,
      sopType: req.sopType,
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
      temperature: 0.7,
      max_tokens: 1200,
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
    tone: req.tone,
    sopType: req.sopType,
  };
}
