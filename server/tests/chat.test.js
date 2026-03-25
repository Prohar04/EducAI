import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockUserProfileFindUnique = jest.fn();
const mockSavedProgramFindMany = jest.fn();
const mockMatchRunFindFirst = jest.fn();
const mockUserRoadmapFindFirst = jest.fn();
const mockStrategyReportFindFirst = jest.fn();

jest.unstable_mockModule('#src/config/database.ts', () => ({
  __esModule: true,
  default: {
    userProfile: { findUnique: mockUserProfileFindUnique },
    savedProgram: { findMany: mockSavedProgramFindMany },
    matchRun: { findFirst: mockMatchRunFindFirst },
    userRoadmap: { findFirst: mockUserRoadmapFindFirst },
    strategyReport: { findFirst: mockStrategyReportFindFirst },
  },
}));

jest.unstable_mockModule('#src/middlewares/authenticate.ts', () => ({
  authMiddleware: (req, _res, next) => {
    req.userId = 'user-123';
    next();
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const { default: request } = await import('supertest');
const { default: app } = await import('#src/app.js');

describe('POST /chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUserProfileFindUnique.mockResolvedValue({
      userId: 'user-123',
      currentStage: 'Undergraduate',
      targetIntake: 'Fall 2027',
      targetCountries: ['CA'],
      intendedLevel: 'MSC',
      level: null,
      intendedMajor: 'Computer Science',
      majorOrTrack: 'Computer Science',
      budgetCurrency: 'USD',
      budgetMax: 32000,
      gpa: 3.71,
      gpaScale: '4.0',
      graduationYear: 2027,
      backlogs: 0,
      workExperienceMonths: 12,
      englishTestType: 'IELTS',
      englishScore: 7.5,
      gre: 320,
      gmat: null,
      testScores: { IELTS: 7.5, GRE: 320 },
      fundingNeed: true,
    });

    mockSavedProgramFindMany.mockResolvedValue([
      {
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        program: {
          id: 'program-1',
          title: 'MSc Computer Science',
          level: 'MSC',
          field: 'Computer Science',
          tuitionMinUSD: 18000,
          tuitionMaxUSD: 24000,
          sourceUrl: 'https://example.edu/msc-cs',
          university: {
            name: 'Example University',
            website: 'https://example.edu',
            country: {
              code: 'CA',
              name: 'Canada',
            },
          },
          deadlines: [
            {
              term: 'Fall 2027',
              deadline: new Date('2026-12-15T00:00:00.000Z'),
            },
          ],
          requirements: [
            {
              key: 'IELTS',
              value: '7.0 overall',
            },
          ],
        },
      },
    ]);

    mockMatchRunFindFirst.mockResolvedValue({
      id: 'run-1',
      results: [
        {
          id: 'match-result-1',
          programId: 'program-1',
          score: 0.88,
          reasons: ['Strong GPA fit', 'English score meets requirement'],
          rawData: null,
          program: {
            title: 'MSc Computer Science',
            university: {
              name: 'Example University',
              country: {
                code: 'CA',
              },
            },
          },
        },
      ],
    });

    mockUserRoadmapFindFirst.mockResolvedValue({
      id: 'roadmap-1',
      countryCode: 'CA',
      intake: 'Fall 2027',
      startMonth: '2026-04',
      endMonth: '2027-09',
      plan: [
        {
          month: '2026-04',
          items: [
            { title: 'Draft SOP outline' },
            { title: 'Book IELTS retake if needed' },
          ],
        },
      ],
    });

    mockStrategyReportFindFirst.mockResolvedValue({
      id: 'strategy-1',
      countryCode: 'CA',
      intake: 'Fall 2027',
      report: {
        summary: 'Canada remains realistic if the shortlist stays tuition-aware.',
        admissionChances: { band: 'Medium' },
        recommendedActions: [{ title: 'Prioritize deadline-ready programs' }],
        riskAssessment: [{ risk: 'Funding gap' }],
      },
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: 'Start with the saved Canadian program because it already aligns with your IELTS score.',
        bullets: ['Your strongest fit is Example University.', 'The next hard deadline is December 15, 2026.'],
        nextSteps: ['Finalize your SOP draft this month.'],
        sources: [
          { type: 'internal', title: 'Program: MSc Computer Science - Example University', id: 'program:program-1' },
          { type: 'web', title: 'Example University admissions', url: 'https://example.edu/msc-cs' },
        ],
        confidence: 'high',
      }),
    });
  });

  it('builds compact context, forwards to ai-server, and wraps the reply', async () => {
    const response = await request(app).post('/chat').send({
      message: 'Compare my saved programs and tell me which deadline matters first.',
      conversationId: 'conv-1',
      history: [
        { role: 'user', content: 'I am targeting Canada.' },
        { role: 'assistant', content: 'Canada looks aligned with your current budget.' },
      ],
    });

    expect(response.status).toBe(200);
    expect(response.body.reply).toMatchObject({
      answer: expect.stringContaining('saved Canadian program'),
      confidence: 'high',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    const payload = JSON.parse(init.body);

    expect(url).toBe('http://localhost:8001/api/v1/chat/answer');
    expect(payload).toMatchObject({
      message: 'Compare my saved programs and tell me which deadline matters first.',
      conversation: {
        id: 'conv-1',
        history: [
          { role: 'user', content: 'I am targeting Canada.' },
          { role: 'assistant', content: 'Canada looks aligned with your current budget.' },
        ],
      },
    });
    expect(payload.userContext.profile).toMatchObject({
      stage: 'Undergraduate',
      targetCountries: ['CA'],
      major: 'Computer Science',
      tests: { IELTS: 7.5, GRE: 320, englishTestType: 'IELTS', englishScore: 7.5 },
    });
    expect(payload.userContext.savedPrograms).toEqual([
      expect.objectContaining({
        sourceId: 'program:program-1',
        title: 'MSc Computer Science',
        university: 'Example University',
      }),
    ]);
    expect(payload.userContext.matchTop).toEqual([
      expect.objectContaining({
        sourceId: 'program:program-1',
        score: 0.88,
      }),
    ]);
    expect(payload.userContext.timelineSummary).toMatchObject({
      sourceId: 'roadmap:roadmap-1',
      highlights: ['Draft SOP outline', 'Book IELTS retake if needed'],
    });
    expect(payload.userContext.strategySummary).toMatchObject({
      sourceId: 'strategy:strategy-1',
      summary: 'Canada remains realistic if the shortlist stays tuition-aware.',
      risks: ['Funding gap'],
    });
  });
});
