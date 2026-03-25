import prisma from '#src/config/database.ts';
import { Prisma } from '#src/generated/client.ts';

const AI_SERVER_URL = process.env.AI_SERVER_URL ?? 'http://localhost:8001';
const AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY ?? '';
const CHAT_RATE_LIMIT_PER_MIN = Number(process.env.CHAT_RATE_LIMIT_PER_MIN ?? '0');
const RATE_LIMIT_WINDOW_MS = 60_000;

const rateLimitByUser = new Map<string, { count: number; windowStartedAt: number }>();

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

export async function answerChatMessage(input: AnswerChatInput): Promise<ChatReply> {
  applyRateLimit(input.userId);

  const userContext = await loadCompactUserContext(input.userId);

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
      signal: AbortSignal.timeout(90_000),
    });
  } catch (error) {
    console.error('[chat/service] ai-server unavailable', error);
    throw new ChatServiceError(502, 'The AI provider is temporarily unavailable. Please try again shortly.');
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
