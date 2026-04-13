import prisma from '#src/config/database.ts';
import { Prisma } from '#src/generated/client.ts';

const AI_SERVER_URL             = process.env.AI_SERVER_URL             ?? 'http://localhost:8001';
const AI_SERVER_API_KEY         = process.env.AI_SERVER_API_KEY         ?? '';
const CHAT_RATE_LIMIT_PER_MIN   = Number(process.env.CHAT_RATE_LIMIT_PER_MIN ?? '0');

// ── Direct LLM provider keys (used when ai-server is unavailable) ─────────────
const GROQ_API_KEY        = process.env.GROQ_API_KEY        ?? '';
const OPENROUTER_API_KEY  = process.env.OPENROUTER_API_KEY  ?? '';
const ANTHROPIC_API_KEY   = process.env.ANTHROPIC_API_KEY   ?? '';
const GEMINI_API_KEY      = process.env.GEMINI_API_KEY      ?? '';
const DIRECT_LLM_TIMEOUT  = 28_000; // 28s — snappy but safe
const RATE_LIMIT_WINDOW_MS = 60_000;
const CONTEXT_CACHE_TTL_MS = 5 * 60_000; // 5-minute cache per user — context rarely changes

const rateLimitByUser = new Map<string, { count: number; windowStartedAt: number }>();

// ── Context cache: avoid re-fetching DB on every message within a session ──
const contextCache = new Map<string, { ctx: CompactUserContext; expiresAt: number }>();

function getCachedContext(userId: string): CompactUserContext | null {
  const entry = contextCache.get(userId);
  if (!entry || Date.now() > entry.expiresAt) {
    contextCache.delete(userId);
    return null;
  }
  return entry.ctx;
}

function setCachedContext(userId: string, ctx: CompactUserContext): void {
  contextCache.set(userId, { ctx, expiresAt: Date.now() + CONTEXT_CACHE_TTL_MS });
  // Evict entries older than 30 minutes to prevent unbounded growth
  if (contextCache.size > 500) {
    const now = Date.now();
    for (const [key, val] of contextCache.entries()) {
      if (now > val.expiresAt) contextCache.delete(key);
    }
  }
}

export type ChatRole = 'user' | 'assistant';

export interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

export interface ChatSource {
  type: 'internal' | 'web';
  title: string;
  id?: string;
  url?: string;
}

export interface ChatReply {
  answer: string;
  bullets: string[];
  nextSteps: string[];
  sources: ChatSource[];
  confidence: 'high' | 'medium' | 'low';
}

export interface AnswerChatInput {
  userId: string;
  message: string;
  conversationId?: string;
  history?: ChatHistoryItem[];
}

interface CompactProfileContext {
  sourceId: string;
  stage: string | null;
  targetIntake: string | null;
  targetCountries: string[];
  level: string | null;
  major: string | null;
  budget: {
    currency: string | null;
    max: number | null;
  };
  academics: {
    gpa: number | null;
    gpaScale: string | null;
    graduationYear: number | null;
    backlogs: number | null;
    workExperienceMonths: number | null;
  };
  tests: Record<string, number | string>;
  fundingNeed: boolean | null;
}

interface CompactSavedProgram {
  sourceId: string;
  programId: string;
  title: string;
  university: string;
  countryCode: string;
  country: string;
  level: string;
  field: string;
  tuitionUSD: {
    min: number | null;
    max: number | null;
  };
  deadlines: Array<{
    term: string;
    deadline: string;
  }>;
  requirements: Array<{
    key: string;
    value: string;
  }>;
  sourceUrl: string | null;
}

interface CompactMatchResult {
  sourceId: string;
  resultId: string;
  programId: string | null;
  title: string;
  university: string | null;
  countryCode: string | null;
  score: number;
  reasons: string[];
}

interface CompactTimelineSummary {
  sourceId: string;
  roadmapId: string;
  countryCode: string;
  intake: string | null;
  range: {
    startMonth: string;
    endMonth: string;
  };
  highlights: string[];
}

interface CompactStrategySummary {
  sourceId: string;
  strategyId: string;
  countryCode: string;
  intake: string | null;
  summary: string | null;
  admissionBand: string | null;
  recommendedActions: string[];
  risks: string[];
}

interface CompactUserContext {
  profile: CompactProfileContext | null;
  savedPrograms: CompactSavedProgram[];
  matchTop: CompactMatchResult[];
  timelineSummary: CompactTimelineSummary | null;
  strategySummary: CompactStrategySummary | null;
}

const savedProgramInclude = {
  program: {
    include: {
      university: {
        include: {
          country: true,
        },
      },
      deadlines: {
        orderBy: { deadline: 'asc' as const },
        take: 3,
      },
      requirements: {
        orderBy: { key: 'asc' as const },
        take: 4,
      },
    },
  },
} as const;

const matchRunInclude = {
  results: {
    take: 10,
    orderBy: { score: 'desc' as const },
    include: {
      program: {
        include: {
          university: {
            include: {
              country: true,
            },
          },
        },
      },
    },
  },
} as const;

type UserProfileForChat = Awaited<ReturnType<typeof prisma.userProfile.findUnique>>;
type UserRoadmapForChat = Awaited<ReturnType<typeof prisma.userRoadmap.findFirst>>;
type StrategyReportForChat = Awaited<ReturnType<typeof prisma.strategyReport.findFirst>>;

interface SavedProgramRecord {
  id: string;
  userId: string;
  programId: string;
  createdAt: Date;
  program: {
    id: string;
    title: string;
    level: string;
    field: string;
    tuitionMinUSD: number | null;
    tuitionMaxUSD: number | null;
    sourceUrl: string | null;
    university: {
      name: string;
      website: string | null;
      country: {
        code: string;
        name: string;
      };
    };
    deadlines: Array<{
      term: string;
      deadline: Date;
    }>;
    requirements: Array<{
      key: string;
      value: string;
    }>;
  };
}

interface MatchRunRecord {
  id: string;
  userId: string;
  status: string;
  progress: number;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  results: Array<{
    id: string;
    programId: string | null;
    score: number;
    reasons: Prisma.JsonValue;
    rawData: Prisma.JsonValue | null;
    program: {
      title: string;
      university: {
        name: string;
        country: {
          code: string;
        };
      };
    } | null;
  }>;
}

export class ChatServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ChatServiceError';
  }
}

function normalizeStringArray(value: unknown, limit = 5): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, limit);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function pickNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function buildProfileContext(profile: UserProfileForChat): CompactProfileContext | null {
  if (!profile) return null;

  const testScores = asRecord(profile.testScores);
  const tests: Record<string, number | string> = {};

  const maybeAssign = (key: string, value: unknown) => {
    const numberValue = pickNumber(value);
    const stringValue = pickString(value);
    if (numberValue !== null) tests[key] = numberValue;
    else if (stringValue !== null) tests[key] = stringValue;
  };

  if (testScores) {
    for (const [key, value] of Object.entries(testScores)) {
      maybeAssign(key, value);
    }
  }

  maybeAssign('englishTestType', profile.englishTestType);
  maybeAssign('englishScore', profile.englishScore);
  maybeAssign('GRE', profile.gre);
  maybeAssign('GMAT', profile.gmat);

  const targetCountries = Array.isArray(profile.targetCountries)
    ? profile.targetCountries.filter((country): country is string => typeof country === 'string')
    : [];

  return {
    sourceId: `profile:${profile.userId}`,
    stage: profile.currentStage ?? null,
    targetIntake: profile.targetIntake ?? null,
    targetCountries,
    level: profile.intendedLevel ?? profile.level ?? null,
    major: profile.intendedMajor ?? profile.majorOrTrack ?? null,
    budget: {
      currency: profile.budgetCurrency ?? null,
      max: profile.budgetMax ?? null,
    },
    academics: {
      gpa: profile.gpa ?? null,
      gpaScale: profile.gpaScale ?? null,
      graduationYear: profile.graduationYear ?? null,
      backlogs: profile.backlogs ?? null,
      workExperienceMonths: profile.workExperienceMonths ?? null,
    },
    tests,
    fundingNeed: profile.fundingNeed ?? null,
  };
}

function summarizeTimelinePlan(planValue: Prisma.JsonValue): string[] {
  if (!Array.isArray(planValue)) return [];

  const highlights: string[] = [];
  for (const month of planValue) {
    const monthRecord = asRecord(month);
    const items = monthRecord ? monthRecord.items : null;
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      const itemRecord = asRecord(item);
      const title = itemRecord ? pickString(itemRecord.title) : null;
      if (title) highlights.push(title);
      if (highlights.length >= 6) return highlights;
    }
  }

  return highlights;
}

function summarizeStrategyReport(reportValue: Prisma.JsonValue): {
  summary: string | null;
  admissionBand: string | null;
  recommendedActions: string[];
  risks: string[];
} {
  const report = asRecord(reportValue);
  if (!report) {
    return {
      summary: null,
      admissionBand: null,
      recommendedActions: [],
      risks: [],
    };
  }

  const admissionChances = asRecord(report.admissionChances);
  const recommendedActions = Array.isArray(report.recommendedActions)
    ? report.recommendedActions
        .map(item => {
          const record = asRecord(item);
          return record ? pickString(record.title) : null;
        })
        .filter((value): value is string => Boolean(value))
        .slice(0, 4)
    : [];
  const risks = Array.isArray(report.riskAssessment)
    ? report.riskAssessment
        .map(item => {
          const record = asRecord(item);
          return record ? pickString(record.risk) : null;
        })
        .filter((value): value is string => Boolean(value))
        .slice(0, 4)
    : [];

  return {
    summary: pickString(report.summary),
    admissionBand: admissionChances ? pickString(admissionChances.band) : null,
    recommendedActions,
    risks,
  };
}

function buildCompactUserContext(data: {
  profile: UserProfileForChat;
  savedPrograms: SavedProgramRecord[];
  latestMatchRun: MatchRunRecord | null;
  latestRoadmap: UserRoadmapForChat;
  latestStrategy: StrategyReportForChat;
}): CompactUserContext {
  const savedPrograms: CompactSavedProgram[] = data.savedPrograms.map(item => ({
    sourceId: `program:${item.program.id}`,
    programId: item.program.id,
    title: item.program.title,
    university: item.program.university.name,
    countryCode: item.program.university.country.code,
    country: item.program.university.country.name,
    level: item.program.level,
    field: item.program.field,
    tuitionUSD: {
      min: item.program.tuitionMinUSD ?? null,
      max: item.program.tuitionMaxUSD ?? null,
    },
    deadlines: item.program.deadlines.map((deadline: SavedProgramRecord['program']['deadlines'][number]) => ({
      term: deadline.term,
      deadline: deadline.deadline.toISOString(),
    })),
    requirements: item.program.requirements.map((requirement: SavedProgramRecord['program']['requirements'][number]) => ({
      key: requirement.key,
      value: requirement.value,
    })),
    sourceUrl: item.program.sourceUrl ?? item.program.university.website ?? null,
  }));

  const matchTop: CompactMatchResult[] =
    data.latestMatchRun?.results.map((result: MatchRunRecord['results'][number]) => {
      const rawData = asRecord(result.rawData);
      return {
        sourceId: result.programId ? `program:${result.programId}` : `match:${result.id}`,
        resultId: result.id,
        programId: result.programId,
        title:
          result.program?.title ??
          pickString(rawData?.program_title) ??
          pickString(rawData?.programTitle) ??
          'Matched program',
        university:
          result.program?.university.name ??
          pickString(rawData?.university_name) ??
          pickString(rawData?.universityName),
        countryCode:
          result.program?.university.country.code ??
          pickString(rawData?.country_code) ??
          pickString(rawData?.countryCode),
        score: result.score,
        reasons: normalizeStringArray(result.reasons, 4),
      };
    }) ?? [];

  const latestRoadmap = data.latestRoadmap
    ? {
        sourceId: `roadmap:${data.latestRoadmap.id}`,
        roadmapId: data.latestRoadmap.id,
        countryCode: data.latestRoadmap.countryCode,
        intake: data.latestRoadmap.intake ?? null,
        range: {
          startMonth: data.latestRoadmap.startMonth,
          endMonth: data.latestRoadmap.endMonth,
        },
        highlights: summarizeTimelinePlan(data.latestRoadmap.plan),
      }
    : null;

  const strategySnapshot = data.latestStrategy ? summarizeStrategyReport(data.latestStrategy.report) : null;
  const latestStrategy = data.latestStrategy
    ? {
        sourceId: `strategy:${data.latestStrategy.id}`,
        strategyId: data.latestStrategy.id,
        countryCode: data.latestStrategy.countryCode,
        intake: data.latestStrategy.intake ?? null,
        summary: strategySnapshot?.summary ?? null,
        admissionBand: strategySnapshot?.admissionBand ?? null,
        recommendedActions: strategySnapshot?.recommendedActions ?? [],
        risks: strategySnapshot?.risks ?? [],
      }
    : null;

  return {
    profile: buildProfileContext(data.profile),
    savedPrograms,
    matchTop,
    timelineSummary: latestRoadmap,
    strategySummary: latestStrategy,
  };
}

function applyRateLimit(userId: string) {
  if (!Number.isFinite(CHAT_RATE_LIMIT_PER_MIN) || CHAT_RATE_LIMIT_PER_MIN <= 0) return;

  const now = Date.now();
  const existing = rateLimitByUser.get(userId);

  if (!existing || now - existing.windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimitByUser.set(userId, { count: 1, windowStartedAt: now });
    return;
  }

  if (existing.count >= CHAT_RATE_LIMIT_PER_MIN) {
    throw new ChatServiceError(429, 'Rate limit reached. Try again in a minute.');
  }

  existing.count += 1;
  rateLimitByUser.set(userId, existing);
}

function parseChatReply(payload: unknown): ChatReply {
  const data = asRecord(payload);
  const sources: ChatSource[] = [];
  if (Array.isArray(data?.sources)) {
    for (const source of data.sources) {
      const record = asRecord(source);
      const type = record?.type === 'web' ? 'web' : record?.type === 'internal' ? 'internal' : null;
      const title = pickString(record?.title);
      if (!type || !title) continue;

      sources.push({
        type,
        title,
        id: pickString(record?.id) ?? undefined,
        url: pickString(record?.url) ?? undefined,
      });

      if (sources.length >= 6) break;
    }
  }

  const confidenceValue = pickString(data?.confidence);
  const confidence =
    confidenceValue === 'high' || confidenceValue === 'medium' || confidenceValue === 'low'
      ? confidenceValue
      : 'medium';

  const answer = pickString(data?.answer);
  if (!answer) {
    throw new ChatServiceError(502, 'Assistant service returned an invalid response.');
  }

  return {
    answer,
    bullets: normalizeStringArray(data?.bullets, 6),
    nextSteps: normalizeStringArray(data?.nextSteps, 6),
    sources,
    confidence,
  };
}

async function loadCompactUserContext(userId: string): Promise<CompactUserContext> {
  const [profile, savedProgramsRaw, latestMatchRunRaw, latestRoadmap, latestStrategy] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
    }),
    prisma.savedProgram.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: savedProgramInclude,
    }),
    prisma.matchRun.findFirst({
      where: {
        userId,
        results: {
          some: {},
        },
      },
      orderBy: { createdAt: 'desc' },
      include: matchRunInclude,
    }),
    prisma.userRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.strategyReport.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const savedPrograms = savedProgramsRaw as unknown as SavedProgramRecord[];
  const latestMatchRun = latestMatchRunRaw as unknown as MatchRunRecord | null;

  return buildCompactUserContext({
    profile,
    savedPrograms,
    latestMatchRun,
    latestRoadmap,
    latestStrategy,
  });
}

// ─── Direct LLM utilities ──────────────────────────────────────────────────────

/** Converts the compact user context to a concise, readable text block for the LLM. */
function formatContextForPrompt(ctx: CompactUserContext): string {
  const parts: string[] = [];

  if (ctx.profile) {
    const p = ctx.profile;
    const budgetStr = p.budget.max
      ? `${p.budget.currency ?? 'USD'} ${p.budget.max.toLocaleString()}/yr`
      : 'Not set';
    const gpaStr = p.academics.gpa
      ? `${p.academics.gpa}${p.academics.gpaScale ? `/${p.academics.gpaScale}` : ''}`
      : 'Not set';
    const testStr = Object.entries(p.tests)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ') || 'None';
    parts.push(
      `[STUDENT PROFILE]`,
      `Stage: ${p.stage ?? '—'} | Intake: ${p.targetIntake ?? '—'} | Countries: ${p.targetCountries.join(', ') || '—'} | Level: ${p.level ?? '—'} | Major: ${p.major ?? '—'}`,
      `GPA: ${gpaStr} | Tests: ${testStr} | Budget: ${budgetStr} | Funding needed: ${p.fundingNeed === true ? 'Yes' : p.fundingNeed === false ? 'No' : '—'}`,
    );
  }

  if (ctx.savedPrograms.length > 0) {
    parts.push(`\n[SAVED PROGRAMS — ${ctx.savedPrograms.length}]`);
    ctx.savedPrograms.slice(0, 8).forEach((sp, i) => {
      const tuition = sp.tuitionUSD.min
        ? `$${sp.tuitionUSD.min.toLocaleString()}–$${(sp.tuitionUSD.max ?? sp.tuitionUSD.min).toLocaleString()}/yr`
        : 'Tuition not listed';
      const deadlineStr = sp.deadlines.slice(0, 2).map(d => `${d.term}: ${d.deadline.slice(0, 10)}`).join(', ');
      parts.push(`${i + 1}. ${sp.title} — ${sp.university} — ${sp.country}`);
      parts.push(`   ${tuition}${deadlineStr ? ` | Deadlines: ${deadlineStr}` : ''}`);
    });
  }

  if (ctx.matchTop.length > 0) {
    parts.push(`\n[AI MATCH RESULTS — top ${Math.min(ctx.matchTop.length, 6)}]`);
    ctx.matchTop.slice(0, 6).forEach(m => {
      const reason = m.reasons.slice(0, 2).join(', ');
      parts.push(`[${m.score}] ${m.title} — ${m.university ?? '?'} (${m.countryCode ?? '?'})${reason ? `: ${reason}` : ''}`);
    });
  }

  if (ctx.timelineSummary) {
    const t = ctx.timelineSummary;
    const hl = t.highlights.slice(0, 4).join(', ');
    parts.push(`\n[TIMELINE — ${t.countryCode}, ${t.intake ?? 'unknown intake'}]`);
    if (hl) parts.push(`Milestones: ${hl}`);
  }

  if (ctx.strategySummary) {
    const s = ctx.strategySummary;
    parts.push(`\n[STRATEGY — ${s.countryCode}]`);
    if (s.admissionBand) parts.push(`Band: ${s.admissionBand}`);
    if (s.recommendedActions.length) parts.push(`Actions: ${s.recommendedActions.slice(0, 3).join('; ')}`);
    if (s.risks.length) parts.push(`Risks: ${s.risks.slice(0, 3).join('; ')}`);
  }

  return parts.join('\n');
}

const DIRECT_SYSTEM_PROMPT = `You are EducAI's study-abroad admissions consultant. Help users plan international education — universities, programs, visas, scholarships, admission requirements, and funding.

Rules:
- Be specific, actionable, and grounded in the user's data when available
- Use the user's profile context to personalise answers
- Never guarantee admission outcomes or visa approval
- For time-sensitive topics (visa rules, deadlines, fee changes), note the info may need verification
- confidence: "high" = specific data available; "medium" = general guidance; "low" = uncertain/general info

Respond ONLY with valid JSON in exactly this schema:
{
  "answer": "Main response in 1-3 sentences — direct and specific",
  "bullets": ["Key point 1", "Key point 2", "Key point 3"],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "confidence": "high|medium|low"
}`;

interface LLMMessage { role: 'system' | 'user' | 'assistant'; content: string; }

function buildLLMMessages(
  contextText: string,
  question: string,
  history: ChatHistoryItem[],
): LLMMessage[] {
  const messages: LLMMessage[] = [{ role: 'system', content: DIRECT_SYSTEM_PROMPT }];

  // Add previous turns (last 4 exchanges)
  for (const h of history.slice(-8)) {
    messages.push({ role: h.role, content: h.content });
  }

  // Current user message includes the context snapshot
  const userContent = contextText
    ? `${contextText}\n\n[QUESTION]\n${question}`
    : question;

  messages.push({ role: 'user', content: userContent });
  return messages;
}

/** Flexible JSON extractor — handles markdown code blocks and raw JSON. */
function extractJSON(raw: string): Record<string, unknown> {
  // Try direct parse first
  try { return JSON.parse(raw); } catch { /* continue */ }
  // Strip markdown code fences
  const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  try { return JSON.parse(stripped); } catch { /* continue */ }
  // Extract first {...} block
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) try { return JSON.parse(match[0]); } catch { /* continue */ }
  throw new Error(`Cannot parse LLM response as JSON: ${raw.slice(0, 200)}`);
}

function normalizeLLMReply(raw: string): ChatReply {
  const data = extractJSON(raw);
  const answer = pickString(data.answer) ?? (Array.isArray(data.bullets) ? String(data.bullets[0] ?? '') : '');
  if (!answer) throw new ChatServiceError(502, 'LLM returned an empty answer.');
  const confidence = ['high', 'medium', 'low'].includes(String(data.confidence))
    ? (data.confidence as ChatReply['confidence'])
    : 'medium';
  return {
    answer,
    bullets:   normalizeStringArray(data.bullets,   5),
    nextSteps: normalizeStringArray(data.nextSteps,  4),
    sources:   [],
    confidence,
  };
}

async function callOpenAICompatible(
  messages: LLMMessage[],
  baseUrl: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 900, response_format: { type: 'json_object' } }),
    signal: AbortSignal.timeout(DIRECT_LLM_TIMEOUT),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    if (res.status === 429) throw new ChatServiceError(429, 'Rate limit reached. Try again in a minute.');
    throw new Error(`${baseUrl} error ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty content from provider');
  return content;
}

async function callAnthropicDirect(messages: LLMMessage[]): Promise<string> {
  const system = messages.find(m => m.role === 'system')?.content ?? '';
  const convo = messages.filter(m => m.role !== 'system');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system,
      messages: convo,
    }),
    signal: AbortSignal.timeout(DIRECT_LLM_TIMEOUT),
  });
  if (!res.ok) {
    if (res.status === 429) throw new ChatServiceError(429, 'Rate limit reached. Try again in a minute.');
    throw new Error(`Anthropic error ${res.status}`);
  }
  const data = await res.json() as { content?: Array<{ text?: string }> };
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty content from Anthropic');
  return text;
}

async function callGeminiDirect(messages: LLMMessage[]): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
  const system = messages.find(m => m.role === 'system')?.content ?? '';
  const userMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';

  const body = {
    contents: [{ role: 'user', parts: [{ text: userMsg }] }],
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json', maxOutputTokens: 900 },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(DIRECT_LLM_TIMEOUT),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty content from Gemini');
  return text;
}

async function callDirectLLM(input: AnswerChatInput, ctx: CompactUserContext): Promise<ChatReply> {
  const contextText = formatContextForPrompt(ctx);
  const messages = buildLLMMessages(contextText, input.message, input.history ?? []);

  let raw: string;
  if (GROQ_API_KEY) {
    raw = await callOpenAICompatible(messages, 'https://api.groq.com/openai/v1', GROQ_API_KEY, 'llama-3.3-70b-versatile');
  } else if (OPENROUTER_API_KEY) {
    raw = await callOpenAICompatible(messages, 'https://openrouter.ai/api/v1', OPENROUTER_API_KEY, 'meta-llama/llama-3.3-70b-instruct:free');
  } else if (ANTHROPIC_API_KEY) {
    raw = await callAnthropicDirect(messages);
  } else if (GEMINI_API_KEY) {
    raw = await callGeminiDirect(messages);
  } else {
    throw new Error('No direct LLM provider configured');
  }

  return normalizeLLMReply(raw);
}

export async function answerChatMessage(input: AnswerChatInput): Promise<ChatReply> {
  applyRateLimit(input.userId);

  // Use cached context when available — avoids 5 DB queries on every message
  const cachedCtx = getCachedContext(input.userId);
  const userContext = cachedCtx ?? await loadCompactUserContext(input.userId);
  if (!cachedCtx) setCachedContext(input.userId, userContext);

  // ── Fast path: direct LLM call (no Python ai-server dependency) ────────────
  const hasDirectProvider = !!(GROQ_API_KEY || OPENROUTER_API_KEY || ANTHROPIC_API_KEY || GEMINI_API_KEY);
  if (hasDirectProvider) {
    try {
      return await callDirectLLM(input, userContext);
    } catch (err) {
      if (err instanceof ChatServiceError && err.statusCode === 429) throw err;
      console.warn('[chat/service] direct LLM failed, falling back to ai-server', (err as Error).message);
      // Fall through to ai-server path
    }
  }

  // ── Fallback: ai-server (Python FastAPI) ───────────────────────────────────
  let aiResponse: Response;
  try {
    aiResponse = await fetch(`${AI_SERVER_URL}/api/v1/chat/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_SERVER_API_KEY ? { 'X-API-Key': AI_SERVER_API_KEY } : {}),
      },
      body: JSON.stringify({
        message: input.message,
        userContext,
        conversation: {
          id: input.conversationId ?? `user:${input.userId}`,
          history: input.history?.slice(-6) ?? [],
        },
      }),
      signal: AbortSignal.timeout(35_000), // 35s — reduced from 45s
    });
  } catch (error) {
    console.error('[chat/service] ai-server unavailable', error);
    // If we had a direct provider but it failed, give a more specific message
    if (hasDirectProvider) {
      throw new ChatServiceError(502, 'The AI provider encountered an error. Please try again in a moment.');
    }
    throw new ChatServiceError(
      502,
      'No AI provider is configured. Add GROQ_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY to enable the assistant.',
    );
  }

  if (!aiResponse.ok) {
    const errorPayload = await aiResponse.json().catch(() => null);
    const errorMessage =
      pickString(asRecord(errorPayload)?.detail) ??
      pickString(asRecord(errorPayload)?.message) ??
      'Failed to generate a reply.';

    if (aiResponse.status === 429) {
      throw new ChatServiceError(429, 'Rate limit reached. Try again in a minute.');
    }

    throw new ChatServiceError(
      aiResponse.status >= 500 ? 502 : aiResponse.status,
      aiResponse.status >= 500
        ? 'The AI provider is temporarily unavailable. Please try again shortly.'
        : errorMessage,
    );
  }

  const payload = await aiResponse.json();
  return parseChatReply(payload);
}
