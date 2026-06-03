/**
 * SOP Service — LLM-powered Statement of Purpose generation.
 *
 * Each of the 10 templates has:
 *   - A distinct SYSTEM prompt that sets voice, register, and forbidden patterns
 *   - A unique structural contract (numbered sections the LLM must follow)
 *   - A calibrated temperature (narrative = higher; technical/compact = lower)
 *   - A precise word-count envelope
 *
 * The combination ensures genuinely different output, not just the same prose
 * with a different label on top.
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

export type SopTone = 'formal' | 'research' | 'personal';
export type SopType = 'general' | 'scholarship' | 'research';

export interface SopRequest {
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
  targetProgram?: string;
  targetUniversity?: string;
  targetCountry?: string;
  targetIntake?: string;
  degreeLevel?: string;
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
  sopTemplate: SopTemplate;
  highlights?: string;
  tone?: SopTone;
  sopType?: SopType;
}

export interface SopResult {
  sop: string;
  wordCount: number;
  template: SopTemplate;
  sopType: SopType;
}

// ── Per-template configuration ────────────────────────────────────────────────

interface TemplateConfig {
  label: string;
  sopType: SopType;
  temperature: number;
  wordRange: string;
  maxTokens: number;
  systemPrompt: string;
  structure: string[];
  forbiddenPatterns: string[];
  openingConstraint: string;
}

const TEMPLATES: Record<SopTemplate, TemplateConfig> = {

  'formal-academic': {
    label: 'Formal Academic',
    sopType: 'general',
    temperature: 0.45,
    wordRange: '650–800',
    maxTokens: 1400,
    systemPrompt:
      'You are a senior academic editor at a Russell Group university. You write Statements of Purpose in ' +
      'formal British/international academic English. Your output is measured, precise, and structured — ' +
      'no hyperbole, no contractions, no first-person exclamations. Every sentence advances an argument. ' +
      'Register: formal, impersonal where appropriate, authoritative.',
    structure: [
      'P1 — Clear statement of intent: degree level, program, institution, and the central academic rationale (NOT a biography)',
      'P2 — Academic background: undergraduate discipline, key modules, thesis/capstone if any; connect directly to target program',
      'P3 — Why this specific program: named modules, faculty areas, or research clusters that align with the applicant',
      'P4 — Academic or professional achievements that demonstrate capacity for graduate-level work',
      'P5 — Precise post-graduate goals; close by tying individual ambition to the field or institution',
    ],
    forbiddenPatterns: [
      'Do NOT open with a quotation.',
      'Do NOT use "I am passionate about" or "I have always been fascinated by".',
      'Do NOT use contractions.',
      'Do NOT use exclamation marks.',
      'Do NOT use vague superlatives like "world-class" or "renowned" without a specific reason.',
    ],
    openingConstraint:
      'Open with a declarative statement that names the program and institution and gives one precise academic reason for applying — in one or two sentences.',
  },

  'research-focused': {
    label: 'Research Focused',
    sopType: 'research',
    temperature: 0.50,
    wordRange: '700–850',
    maxTokens: 1500,
    systemPrompt:
      'You are a research mentorship coordinator at a top-10 research university. You write SOPs for ' +
      'students applying to research-intensive master\'s or PhD programs. Your SOPs read like the opening ' +
      'pages of a strong thesis proposal: a clear intellectual problem, the applicant\'s trajectory toward ' +
      'it, and a precise articulation of what they will do in this program. Avoid generic descriptions of ' +
      'the applicant\'s love of learning — focus on the specific research question and methodology.',
    structure: [
      'P1 — State the specific research problem or intellectual question the applicant wants to investigate',
      'P2 — Prior research experience: specific projects, methods used, key findings, and what was left unresolved',
      'P3 — Academic background that trained them for this research; cite specific coursework or skills',
      'P4 — Why this program/supervisor: name specific faculty, labs, or ongoing research that align with the question',
      'P5 — Proposed research direction and the broader contribution to the field if successful',
    ],
    forbiddenPatterns: [
      'Do NOT write generically about "a passion for research".',
      'Do NOT describe undergraduate courses without linking them to a research skill or finding.',
      'Do NOT open with a quotation or an anecdote.',
      'Do NOT use "contribute to society" as a closing without a specific mechanism.',
    ],
    openingConstraint:
      'Open by stating the research problem or intellectual gap directly — name the field, the unresolved question, and why it matters. The applicant\'s name or biography must not appear in the first paragraph.',
  },

  'scholarship-focused': {
    label: 'Scholarship Focused',
    sopType: 'scholarship',
    temperature: 0.55,
    wordRange: '650–800',
    maxTokens: 1400,
    systemPrompt:
      'You are a scholarship committee member who has read thousands of applications and now writes them. ' +
      'You know that committees are looking for: (1) exceptional measurable achievement, (2) clear leadership or community impact, ' +
      '(3) a credible and ambitious vision for using the degree. Your SOPs lead with the strongest achievement, ' +
      'quantify wherever possible, and close with a compelling social-impact statement. ' +
      'Avoid self-congratulatory language — let the facts speak. Every paragraph earns its position by showing fit with scholarship values.',
    structure: [
      'P1 — Lead with the single strongest, most quantifiable academic or leadership achievement',
      'P2 — Academic merit: GPA, awards, honours, publications, or recognition with numbers where possible',
      'P3 — Leadership and community impact: specific roles, initiatives launched, people reached, outcomes achieved',
      'P4 — Why this scholarship and program specifically: show you researched the donor values or program priorities',
      'P5 — Future contribution: specific, ambitious plan for how the degree enables broader societal impact',
    ],
    forbiddenPatterns: [
      'Do NOT start with childhood dreams or personal backstory.',
      'Do NOT use vague impact language without a specific mechanism.',
      'Do NOT use "I am humbled" or "I am honoured to apply".',
      'Do NOT repeat the scholarship name more than twice.',
    ],
    openingConstraint:
      'Open with the single most impressive, specific achievement — name the award, rank, or metric in the first two sentences.',
  },

  'personal-story': {
    label: 'Personal Story Driven',
    sopType: 'general',
    temperature: 0.80,
    wordRange: '680–820',
    maxTokens: 1500,
    systemPrompt:
      'You are a literary editor who specialises in personal essays for elite graduate admissions. ' +
      'Your SOPs read like a condensed memoir: vivid, specific, honest. You use a single defining moment or ' +
      'sensory detail as an anchor, then zoom out to show the intellectual or professional journey it catalysed. ' +
      'The best personal-story SOPs feel written by the applicant, not about them. Use active verbs, concrete ' +
      'details, and resist the urge to explain every emotion — trust the story to carry the meaning. ' +
      'Register: literary, personal, mature — not casual.',
    structure: [
      'P1 — Open with a specific scene, moment, or observation that encapsulates the central theme (no more than 3 sentences)',
      'P2 — Zoom out: how that moment shaped academic and intellectual curiosity; trace the journey',
      'P3 — Key academic/professional experience that grew from that seed, with concrete detail',
      'P4 — Why this program: how it is the logical next chapter in the story',
      'P5 — Where the story goes next: career or research vision framed as the natural continuation',
    ],
    forbiddenPatterns: [
      'Do NOT open with a quotation from a famous person.',
      'Do NOT use clichés like "from a young age" or "ever since I was a child".',
      'Do NOT explain your emotions — show the actions and decisions instead.',
      'Do NOT use the phrase "my journey".',
      'Do NOT summarise the paragraph you just wrote at the end of it.',
    ],
    openingConstraint:
      'Open in media res — in the middle of a scene. First sentence must be a specific image or action, not a statement of intent.',
  },

  'professional-career': {
    label: 'Professional / Career Oriented',
    sopType: 'general',
    temperature: 0.55,
    wordRange: '650–780',
    maxTokens: 1400,
    systemPrompt:
      'You are a senior career services advisor at a business school. You write SOPs for professionals ' +
      'returning to academia to accelerate or pivot their careers. Your SOPs read like a strategic business case: ' +
      'clear problem (career gap or ceiling), proposed solution (this degree), and projected ROI (post-degree trajectory). ' +
      'Quantify impact in every professional paragraph. Show progression, not just history. ' +
      'The tone is confident and forward-looking, not retrospective.',
    structure: [
      'P1 — Professional context: current role/industry, the specific career challenge or inflection point driving this application',
      'P2 — Professional achievements and progression with measurable impact (numbers, team sizes, business outcomes)',
      'P3 — Academic qualifications that earned the right to this degree; bridge academic-to-professional skills',
      'P4 — Why this program now: specific skills or knowledge the applicant cannot gain without graduate study',
      'P5 — Post-degree plan: specific role, industry, or impact, with a realistic 3–5 year horizon',
    ],
    forbiddenPatterns: [
      'Do NOT write chronological biography — focus on impact and progression.',
      'Do NOT use generic phrases like "I seek to enhance my knowledge".',
      'Do NOT list job duties — describe business outcomes and decisions made.',
      'Do NOT use "I hope to" — use "I will" or "I intend to".',
    ],
    openingConstraint:
      'Open with the specific professional problem or ceiling the applicant is facing — name the industry, the gap, and why graduate education is the precise solution.',
  },

  'technical-engineering': {
    label: 'Technical / Engineering',
    sopType: 'general',
    temperature: 0.40,
    wordRange: '620–780',
    maxTokens: 1400,
    systemPrompt:
      'You are a technical hiring manager at a deep-tech company who also writes graduate SOP coaching letters. ' +
      'You write SOPs for engineers and scientists that read like well-structured design documents: crisp, ' +
      'evidence-based, quantified. You name specific technologies, methodologies, and systems. You do not use ' +
      'emotional language — you use performance metrics and technical problem statements. ' +
      'Every bullet point or claim has a number or a named system attached.',
    structure: [
      'P1 — Technical background: degree, specialisation, key skills and tools mastered (name them explicitly)',
      'P2 — Key engineering project(s): what problem was solved, what approach was taken, what was the measurable outcome',
      'P3 — Technical gap or challenge that graduate study addresses: what this program teaches that self-study or work cannot',
      'P4 — Why this specific program or lab: named courses, research groups, or faculty whose work aligns with the technical interest',
      'P5 — Technical career trajectory: specific role, sector, and the engineering problem to be worked on',
    ],
    forbiddenPatterns: [
      'Do NOT use vague phrases like "I am interested in technology" or "I want to make an impact".',
      'Do NOT describe projects without naming the technology stack or methodology.',
      'Do NOT omit metrics — every project paragraph needs at least one number.',
      'Do NOT use first-person emotional language ("I feel", "I believe", "I am passionate").',
    ],
    openingConstraint:
      'Open with a specific technical skill or project — name the technology and the problem it solved in the first sentence.',
  },

  'business-management': {
    label: 'Business / Management (MBA)',
    sopType: 'general',
    temperature: 0.55,
    wordRange: '650–800',
    maxTokens: 1400,
    systemPrompt:
      'You are an MBA admissions coach for top-20 business schools. You write SOPs that mirror the MBA ' +
      'application essays that get people into HBS, Wharton, LBS, and INSEAD. Your SOPs demonstrate: ' +
      '(1) clear leadership experience with business impact, (2) a concrete and plausible post-MBA goal, ' +
      '(3) specific reason this program (name professors, clubs, or case competitions) enables the goal. ' +
      'Use the "past-present-future" framework: what you\'ve done, where you are, where you\'re going. ' +
      'MBA SOPs must be goal-oriented, not biographical.',
    structure: [
      'P1 (Present-to-Future hook): Start with the specific short-term post-MBA goal — role, sector, geography',
      'P2 (Past — leadership impact): Key professional achievement with business metrics; show people leadership, not just individual contribution',
      'P3 (Past — growth moment): A challenge, failure, or turning point that shaped leadership style or business thinking',
      'P4 (Program fit): Named courses, professors, clubs, or programme features that enable the stated goal',
      'P5 (Long-term vision): Where will this MBA lead in 10 years — specific aspiration that reflects ambition without grandiosity',
    ],
    forbiddenPatterns: [
      'Do NOT use "synergy", "leverage", "impactful", "passionate", or "stakeholder" without specific context.',
      'Do NOT start with your childhood or early life.',
      'Do NOT describe MBA as a way to "expand your horizons".',
      'Do NOT write about the quality of the campus or rankings.',
    ],
    openingConstraint:
      'Open with the specific post-MBA goal: name the role, sector, and why this MBA is the necessary bridge — in the first two sentences.',
  },

  'compact-direct': {
    label: 'Compact & Direct (≤500 words)',
    sopType: 'general',
    temperature: 0.35,
    wordRange: '380–500',
    maxTokens: 750,
    systemPrompt:
      'You are a minimalist technical writer. You write SOPs under 500 words that contain zero filler. ' +
      'Every sentence must carry information. If a sentence could be removed without losing meaning, it must be removed. ' +
      'No adjectives unless they carry specific information. No adverbs. No transition phrases like "Furthermore" or "In conclusion". ' +
      'The style is clear, confident, and reads like a well-crafted executive summary: front-load the key point, then support it.',
    structure: [
      'Sentence 1–2: Who the applicant is and exactly what they are applying for and why (one crisp statement)',
      'Sentence 3–6: Two or three specific achievements or skills that qualify them (no more)',
      'Sentence 7–9: Why this program specifically — name one or two concrete features, not generalities',
      'Sentence 10–12: Precise post-degree goal — one role, one sector, one horizon',
      'Final sentence: One-line closing that reinforces fit — no generic statement',
    ],
    forbiddenPatterns: [
      'Do NOT use more than 500 words — hard limit.',
      'Do NOT use any filler phrase: "I am excited", "I look forward to", "I am passionate".',
      'Do NOT use more than 5 paragraphs — the whole document should fit in 3–4.',
      'Do NOT repeat any information stated earlier in the document.',
    ],
    openingConstraint:
      'First sentence must state: name (optional), target degree, target program, and the single most relevant qualification. Zero warm-up.',
  },

  'highly-persuasive': {
    label: 'Highly Persuasive',
    sopType: 'general',
    temperature: 0.82,
    wordRange: '680–820',
    maxTokens: 1500,
    systemPrompt:
      'You are a speechwriter and rhetoric coach who has crossed over into graduate admissions writing. ' +
      'You write SOPs that move readers — they use rhetorical techniques deliberately: ' +
      'ethos (establishing credibility), logos (evidence and logic), pathos (specific emotional resonance). ' +
      'Your SOPs build like a legal argument: open with the claim, develop the evidence, close with conviction. ' +
      'Every paragraph serves the central thesis. The voice is confident, urgent, and distinctive — never generic.',
    structure: [
      'P1 — Opening claim: the most persuasive single statement about why this applicant, this program, this moment (bold, specific, arguable)',
      'P2 — Establish credibility (ethos): specific evidence — named achievements, projects, or roles — not just credentials',
      'P3 — Build the case (logos): connect academic and professional trajectory to the program with cause-and-effect logic',
      'P4 — Unique perspective or value-add: what does this applicant see or bring that others do not?',
      'P5 — Closing argument: forward-looking, memorable, and specific — leave the committee with a single clear image of this applicant\'s future',
    ],
    forbiddenPatterns: [
      'Do NOT use passive voice in the opening or closing paragraphs.',
      'Do NOT make claims you cannot support with evidence in the same or next sentence.',
      'Do NOT end with "I am confident I will be a valuable addition to your program".',
      'Do NOT use a quotation from a famous person as the opening.',
    ],
    openingConstraint:
      'Open with the single most persuasive, arguable claim about this applicant — specific, bold, and supported within the same paragraph. NOT a biographical statement.',
  },

  'phd-proposal': {
    label: 'PhD Research Proposal',
    sopType: 'research',
    temperature: 0.35,
    wordRange: '750–900',
    maxTokens: 1600,
    systemPrompt:
      'You are a doctoral committee member at a research university who supervises PhD proposal writing. ' +
      'You write PhD SOPs in the style of a well-structured academic proposal: a clear research problem, ' +
      'a literature gap, a proposed methodology, prior evidence of research competence, and precise supervisor fit. ' +
      'Your language is formal, precise, and disciplinary — you use field-appropriate terminology. ' +
      'You distinguish clearly between what is known, what is contested, and what the applicant proposes to contribute. ' +
      'This is not a personal statement — it is a research vision document.',
    structure: [
      'P1 — Research problem: state the specific research gap or unresolved question in the field with academic precision',
      'P2 — Literature positioning: what existing scholarship says and where it is insufficient or contradictory',
      'P3 — Applicant\'s research background: prior thesis, lab work, publications, or supervised projects that demonstrate readiness',
      'P4 — Proposed research direction: tentative methodology, theoretical framework, or analytical approach',
      'P5 — Supervisor and program fit: name specific faculty, research clusters, or facilities that make this institution the right one for this research',
      'P6 — Anticipated contribution: what the field will gain if this research succeeds',
    ],
    forbiddenPatterns: [
      'Do NOT use first-person narratives about personal motivation.',
      'Do NOT describe the research as "important" without explaining why.',
      'Do NOT fabricate citations or references.',
      'Do NOT use emotionally charged language — maintain the register of academic writing.',
    ],
    openingConstraint:
      'Open with the research problem statement, not the applicant\'s background. Name the field, the specific gap, and why addressing it matters — before any mention of the applicant\'s qualifications.',
  },
};

// ── Generate SOP ──────────────────────────────────────────────────────────────

export async function generateSop(req: SopRequest): Promise<SopResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';

  const cfg = TEMPLATES[req.sopTemplate] ?? TEMPLATES['formal-academic'];

  const sopType: SopType = req.sopType ?? cfg.sopType;

  // Profile block
  const profileLines = [
    req.name && `Applicant name: ${req.name}`,
    req.currentDegree && `Current degree: ${req.currentDegree}`,
    req.majorOrTrack && `Current major/track: ${req.majorOrTrack}`,
    req.gpa && `GPA: ${req.gpa}${req.gpaScale ? `/${req.gpaScale}` : ''}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.intendedMajor && `Intended major: ${req.intendedMajor}`,
    req.intendedLevel && `Target level: ${req.intendedLevel}`,
  ].filter(Boolean).join('\n');

  const targetLines = [
    req.targetProgram && `Program: ${req.targetProgram}`,
    req.targetUniversity && `University: ${req.targetUniversity}`,
    req.targetCountry && `Country: ${req.targetCountry}`,
    req.targetIntake && `Intake: ${req.targetIntake}`,
    req.degreeLevel && `Degree: ${req.degreeLevel}`,
  ].filter(Boolean).join('\n');

  const contextLines = [
    req.sopPurpose && `Angle/purpose: ${req.sopPurpose}`,
    req.motivation && `Core motivation: ${req.motivation}`,
    req.academicBackground && `Academic background: ${req.academicBackground}`,
    req.whySubject && `Why this subject: ${req.whySubject}`,
    req.whyUniversity && `Why this university: ${req.whyUniversity}`,
    req.whyCountry && `Why this country: ${req.whyCountry}`,
    req.careerGoals && `Career goals: ${req.careerGoals}`,
    req.researchInterests && `Research interests: ${req.researchInterests}`,
    req.achievements && `Key achievements: ${req.achievements}`,
    req.workExperience && `Work/internship: ${req.workExperience}`,
    req.projects && `Projects: ${req.projects}`,
    req.challengesOvercome && `Challenges overcome: ${req.challengesOvercome}`,
    req.scholarshipAngle && `Scholarship angle: ${req.scholarshipAngle}`,
    req.highlights && `Additional: ${req.highlights}`,
  ].filter(Boolean).join('\n');

  const userPrompt = `TEMPLATE: ${cfg.label}

STRUCTURAL CONTRACT — follow each section in order:
${cfg.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

OPENING RULE: ${cfg.openingConstraint}

FORBIDDEN PATTERNS (violating any of these is a failure):
${cfg.forbiddenPatterns.map(p => `- ${p}`).join('\n')}

WORD COUNT: ${cfg.wordRange} words. Compact-direct must be ≤500.

--- APPLICANT PROFILE ---
${profileLines || 'Profile not fully provided — infer from context.'}

--- APPLICATION TARGET ---
${targetLines || 'Target not specified — write a general SOP in the requested template style.'}

--- STUDENT-PROVIDED CONTEXT ---
${contextLines || 'No additional context provided.'}

CRITICAL RULES:
- Do NOT invent specific institutions, professors, awards, publications, or experiences not mentioned above.
- Write ONLY the SOP text. No titles, no headings, no word-count marker, no meta-commentary.
- If context is sparse, follow the structural contract with plausible generalizations — do not fabricate specifics.`;

  if (!apiKey) {
    const fallback = [
      `Statement of Purpose — ${cfg.label}`,
      '',
      `[Configure OPENAI_API_KEY or OPENROUTER_API_KEY to enable AI-generated SOP.]`,
      '',
      `Applying for: ${req.targetProgram ?? req.intendedLevel ?? 'Graduate Program'}${req.targetUniversity ? ` at ${req.targetUniversity}` : ''}.`,
      `Template selected: ${cfg.label}. Once an API key is configured, this template will generate output with the following structure:`,
      cfg.structure.map((s, i) => `  ${i + 1}. ${s}`).join('\n'),
    ].join('\n');
    return { sop: fallback, wordCount: 0, template: req.sopTemplate, sopType };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: cfg.systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: cfg.temperature,
      max_tokens: cfg.maxTokens,
    }),
    signal: AbortSignal.timeout(35_000),
  });

  if (!response.ok) throw new Error(`LLM error: ${response.status}`);

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
