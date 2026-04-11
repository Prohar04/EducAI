import prisma from '#src/config/database.ts';
import type { Prisma } from '#src/generated/client.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScholarshipFilters {
  q?: string;
  countryCode?: string;
  level?: string;
  field?: string;
  fundingType?: string;
  financialNeed?: boolean;
  page?: number;
  limit?: number;
}

export interface EligibilityResult {
  scholarshipId: string;
  status: 'eligible' | 'partially_eligible' | 'not_eligible';
  score: number; // 0-100
  metCriteria: string[];
  missingCriteria: string[];
  improvementActions: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface ProbabilityFactor {
  factor: string;
  weight: number;
  score: number; // 0-1
  note: string;
}

export interface ProbabilityResult {
  scholarshipId: string;
  probabilityBand: 'High' | 'Medium' | 'Low';
  probabilityPct: number;
  factors: ProbabilityFactor[];
  weaknesses: string[];
  improvementActions: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface UserProfileSnapshot {
  gpa?: number | null;
  gpaScale?: string | null;
  englishTestType?: string | null;
  englishScore?: number | null;
  gre?: number | null;
  gmat?: number | null;
  fundingNeed?: boolean | null;
  level?: string | null;
  intendedLevel?: string | null;
  majorOrTrack?: string | null;
  intendedMajor?: string | null;
  workExperienceMonths?: number | null;
  graduationYear?: number | null;
  targetCountries?: string[] | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalise GPA to a 4.0 scale for comparison */
function normalizeGpa(gpa: number | null | undefined, scale: string | null | undefined): number | null {
  if (!gpa) return null;
  const scaleStr = (scale ?? '4.0').toString();
  if (scaleStr === '4.0') return gpa;
  if (scaleStr === '10') return (gpa / 10) * 4;
  if (scaleStr === '5') return (gpa / 5) * 4;
  if (scaleStr === '%') return (gpa / 100) * 4;
  return gpa; // fallback — treat as 4.0 scale
}

function gpaLabel(gpa: number | null | undefined, scale: string | null | undefined): string {
  if (!gpa) return 'N/A';
  return `${gpa} / ${scale ?? '4.0'}`;
}

// ── Scholarship Search ────────────────────────────────────────────────────────

export async function searchScholarships(filters: ScholarshipFilters) {
  const { q, countryCode, level, field, fundingType, financialNeed, page = 1, limit = 20 } = filters;

  const skip = (page - 1) * limit;

  // Build the where clause with proper Prisma types
  const andClauses: Prisma.ScholarshipWhereInput[] = [{ isActive: true }];

  if (countryCode) {
    andClauses.push({ OR: [{ countryCode }, { countryCode: null }] });
  }

  if (level) {
    andClauses.push({ level: level.toUpperCase() as Prisma.EnumProgramLevelFilter['equals'] });
  }

  if (field) {
    andClauses.push({ field: { contains: field, mode: 'insensitive' } });
  }

  if (fundingType) {
    andClauses.push({ fundingType: fundingType.toLowerCase() });
  }

  if (financialNeed === true) {
    andClauses.push({ financialNeedRequired: true });
  }

  if (q) {
    andClauses.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { provider: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { field: { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  const where: Prisma.ScholarshipWhereInput = andClauses.length === 1
    ? andClauses[0]
    : { AND: andClauses };

  const [items, total] = await Promise.all([
    prisma.scholarship.findMany({
      where,
      include: {
        deadlines: {
          orderBy: { deadline: 'asc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.scholarship.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getScholarshipById(id: string) {
  return prisma.scholarship.findUnique({
    where: { id },
    include: {
      deadlines: {
        orderBy: { deadline: 'asc' },
      },
    },
  });
}

// ── Upcoming Deadlines ────────────────────────────────────────────────────────

export async function getUpcomingDeadlines(daysAhead = 90) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  return prisma.scholarshipDeadline.findMany({
    where: {
      deadline: { gte: now, lte: cutoff },
      scholarship: { isActive: true },
    },
    include: {
      scholarship: {
        select: {
          id: true,
          title: true,
          provider: true,
          countryCode: true,
          level: true,
          amount: true,
          fundingType: true,
          url: true,
        },
      },
    },
    orderBy: { deadline: 'asc' },
    take: 20,
  });
}

// ── Eligibility Engine ────────────────────────────────────────────────────────

export async function checkEligibility(
  scholarshipId: string,
  profile: UserProfileSnapshot,
): Promise<EligibilityResult> {
  const scholarship = await prisma.scholarship.findUnique({
    where: { id: scholarshipId },
    include: { deadlines: { orderBy: { deadline: 'asc' }, take: 1 } },
  });

  if (!scholarship) {
    return {
      scholarshipId,
      status: 'not_eligible',
      score: 0,
      metCriteria: [],
      missingCriteria: ['Scholarship not found'],
      improvementActions: [],
      confidence: 'low',
    };
  }

  const met: string[] = [];
  const missing: string[] = [];
  const actions: string[] = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  // --- GPA check ---
  if (scholarship.minGpa) {
    totalWeight += 30;
    const normalised = normalizeGpa(profile.gpa, profile.gpaScale);
    if (normalised !== null && normalised >= scholarship.minGpa) {
      met.push(`GPA meets minimum (${gpaLabel(profile.gpa, profile.gpaScale)} ≥ ${scholarship.minGpa}/4.0)`);
      earnedWeight += 30;
    } else {
      const needed = scholarship.minGpa;
      missing.push(`GPA below minimum (need ≥ ${needed}/4.0, have ${gpaLabel(profile.gpa, profile.gpaScale)})`);
      actions.push(`Aim to raise your GPA to at least ${needed}/4.0 before applying`);
    }
  } else {
    // No GPA requirement
    met.push('No minimum GPA requirement');
    totalWeight += 10;
    earnedWeight += 10;
  }

  // --- Degree level check ---
  if (scholarship.level) {
    totalWeight += 20;
    const profileLevel = (profile.intendedLevel ?? profile.level ?? '').toUpperCase();
    if (profileLevel === scholarship.level.toString()) {
      met.push(`Degree level matches (${scholarship.level})`);
      earnedWeight += 20;
    } else {
      missing.push(`Degree level mismatch (scholarship is for ${scholarship.level}, you are targeting ${profileLevel || 'unknown'})`);
      actions.push(`This scholarship is specifically for ${scholarship.level} programmes`);
    }
  }

  // --- Nationality check ---
  const eligibleNats = scholarship.eligibleNationalities as string[] | null;
  if (eligibleNats && eligibleNats.length > 0) {
    totalWeight += 25;
    const profileCountries = profile.targetCountries ?? [];
    // We can't know student nationality from profile alone; treat as partial/unknown
    met.push('Nationality eligibility: verify you are from an eligible country');
    earnedWeight += 12; // partial credit
    actions.push(`Confirm your nationality is in the eligible list: ${eligibleNats.slice(0, 5).join(', ')}${eligibleNats.length > 5 ? '...' : ''}`);
  } else {
    met.push('Open to all nationalities');
    totalWeight += 25;
    earnedWeight += 25;
  }

  // --- English test check ---
  if (scholarship.requiresEnglishTest) {
    totalWeight += 15;
    if (profile.englishTestType && profile.englishScore) {
      met.push(`English test provided (${profile.englishTestType}: ${profile.englishScore})`);
      earnedWeight += 15;
    } else {
      missing.push('English proficiency test required (IELTS/TOEFL)');
      actions.push('Take IELTS or TOEFL and achieve the required score before applying');
    }
  }

  // --- Financial need check ---
  if (scholarship.financialNeedRequired) {
    totalWeight += 10;
    if (profile.fundingNeed === true) {
      met.push('Financial need requirement met (you indicated funding need)');
      earnedWeight += 10;
    } else {
      missing.push('This scholarship requires demonstrated financial need');
      actions.push('Prepare financial need documentation (income statements, bank statements)');
    }
  }

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 50;

  let status: EligibilityResult['status'];
  if (missing.length === 0) {
    status = 'eligible';
  } else if (score >= 50) {
    status = 'partially_eligible';
  } else {
    status = 'not_eligible';
  }

  const confidence: EligibilityResult['confidence'] =
    totalWeight >= 50 ? 'high' : totalWeight >= 20 ? 'medium' : 'low';

  return {
    scholarshipId,
    status,
    score,
    metCriteria: met,
    missingCriteria: missing,
    improvementActions: actions,
    confidence,
  };
}

// ── Funding Probability Predictor ─────────────────────────────────────────────

export async function predictFundingProbability(
  scholarshipId: string,
  profile: UserProfileSnapshot,
): Promise<ProbabilityResult> {
  const scholarship = await prisma.scholarship.findUnique({ where: { id: scholarshipId } });

  if (!scholarship) {
    return {
      scholarshipId,
      probabilityBand: 'Low',
      probabilityPct: 0,
      factors: [],
      weaknesses: ['Scholarship not found'],
      improvementActions: [],
      confidence: 'low',
    };
  }

  const factors: ProbabilityFactor[] = [];
  const weaknesses: string[] = [];
  const actions: string[] = [];

  // Factor 1: Academic standing (GPA) — weight 30%
  const normalizedGpa = normalizeGpa(profile.gpa, profile.gpaScale);
  const minGpa = (scholarship.minGpa ?? 2.5);
  let gpaScore = 0;
  if (normalizedGpa !== null) {
    gpaScore = Math.min(1, Math.max(0, (normalizedGpa - minGpa) / (4.0 - minGpa)));
    if (normalizedGpa < minGpa) {
      weaknesses.push(`GPA of ${profile.gpa} is below the ${minGpa}/4.0 minimum`);
      actions.push('Improve your academic record or look for scholarships with lower GPA requirements');
    }
  } else {
    gpaScore = 0.5; // unknown — neutral
  }
  factors.push({
    factor: 'Academic Standing (GPA)',
    weight: 0.30,
    score: parseFloat(gpaScore.toFixed(2)),
    note: normalizedGpa !== null
      ? `${gpaLabel(profile.gpa, profile.gpaScale)} (min required: ${minGpa}/4.0)`
      : 'GPA not provided — assumed neutral',
  });

  // Factor 2: English proficiency — weight 20%
  let englishScore = 0.5;
  if (scholarship.requiresEnglishTest) {
    if (profile.englishTestType && profile.englishScore) {
      // IELTS band targets (approximate scholarship requirements)
      if (profile.englishTestType === 'IELTS') {
        englishScore = profile.englishScore >= 7.5 ? 1.0
          : profile.englishScore >= 7.0 ? 0.85
          : profile.englishScore >= 6.5 ? 0.65
          : 0.3;
      } else if (profile.englishTestType === 'TOEFL') {
        englishScore = profile.englishScore >= 105 ? 1.0
          : profile.englishScore >= 95 ? 0.85
          : profile.englishScore >= 80 ? 0.65
          : 0.3;
      } else {
        englishScore = 0.7;
      }
    } else {
      englishScore = 0.1;
      weaknesses.push('English proficiency test not provided');
      actions.push('Take IELTS ≥ 7.0 or TOEFL ≥ 95 to strengthen your application');
    }
  } else {
    englishScore = profile.englishTestType ? 0.8 : 0.6;
  }
  factors.push({
    factor: 'English Proficiency',
    weight: 0.20,
    score: parseFloat(englishScore.toFixed(2)),
    note: profile.englishTestType
      ? `${profile.englishTestType}: ${profile.englishScore}`
      : 'No test score provided',
  });

  // Factor 3: Profile completeness — weight 15%
  const profileFields = [
    profile.gpa, profile.englishTestType, profile.majorOrTrack ?? profile.intendedMajor,
    profile.workExperienceMonths, profile.fundingNeed,
  ];
  const filled = profileFields.filter(f => f !== null && f !== undefined).length;
  const completenessScore = filled / profileFields.length;
  if (completenessScore < 0.6) {
    weaknesses.push('Incomplete profile reduces match accuracy');
    actions.push('Complete your profile (GPA, test scores, major, work experience) for a more accurate assessment');
  }
  factors.push({
    factor: 'Profile Completeness',
    weight: 0.15,
    score: parseFloat(completenessScore.toFixed(2)),
    note: `${filled}/${profileFields.length} key fields completed`,
  });

  // Factor 4: Work experience (for MSc/PhD competitive scholarships) — weight 15%
  const workMonths = profile.workExperienceMonths ?? 0;
  let workScore = 0;
  if (workMonths >= 24) workScore = 1.0;
  else if (workMonths >= 12) workScore = 0.75;
  else if (workMonths >= 6) workScore = 0.5;
  else if (workMonths > 0) workScore = 0.25;
  else workScore = 0.2; // no experience — not catastrophic for most scholarships

  factors.push({
    factor: 'Work / Research Experience',
    weight: 0.15,
    score: parseFloat(workScore.toFixed(2)),
    note: workMonths > 0 ? `${workMonths} months` : 'No work experience listed',
  });

  // Factor 5: Financial need alignment — weight 10%
  let needScore = 0.5;
  if (scholarship.financialNeedRequired) {
    needScore = profile.fundingNeed === true ? 1.0 : 0.2;
    if (profile.fundingNeed !== true) {
      weaknesses.push('Financial need required but not indicated in your profile');
      actions.push('If you have financial need, update your profile and prepare supporting documentation');
    }
  } else {
    needScore = 0.7; // neutral — no need requirement
  }
  factors.push({
    factor: 'Financial Need Alignment',
    weight: 0.10,
    score: parseFloat(needScore.toFixed(2)),
    note: scholarship.financialNeedRequired
      ? (profile.fundingNeed ? 'Aligned — need indicated' : 'Required but not indicated')
      : 'No financial need requirement',
  });

  // Factor 6: Degree level match — weight 10%
  let levelScore = 0.5;
  if (scholarship.level) {
    const pLevel = (profile.intendedLevel ?? profile.level ?? '').toUpperCase();
    levelScore = pLevel === scholarship.level.toString() ? 1.0 : 0.1;
    if (levelScore < 0.5) {
      weaknesses.push(`Level mismatch: scholarship is for ${scholarship.level}`);
    }
  } else {
    levelScore = 0.75; // open to all levels
  }
  factors.push({
    factor: 'Degree Level Match',
    weight: 0.10,
    score: parseFloat(levelScore.toFixed(2)),
    note: scholarship.level
      ? `Scholarship for ${scholarship.level}, your target: ${profile.intendedLevel ?? profile.level ?? 'unknown'}`
      : 'Open to all degree levels',
  });

  // Weighted total
  const rawPct = factors.reduce((acc, f) => acc + f.weight * f.score * 100, 0);
  const probabilityPct = Math.round(Math.min(95, Math.max(5, rawPct)));

  const probabilityBand: ProbabilityResult['probabilityBand'] =
    probabilityPct >= 65 ? 'High' : probabilityPct >= 40 ? 'Medium' : 'Low';

  const confidence: ProbabilityResult['confidence'] =
    filled >= 4 ? 'high' : filled >= 2 ? 'medium' : 'low';

  return {
    scholarshipId,
    probabilityBand,
    probabilityPct,
    factors,
    weaknesses,
    improvementActions: actions,
    confidence,
  };
}

// ── Eligible Scholarships ─────────────────────────────────────────────────────

export async function getEligibleScholarships(profile: UserProfileSnapshot, limit = 10) {
  const scholarships = await prisma.scholarship.findMany({
    where: { isActive: true },
    include: { deadlines: { orderBy: { deadline: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
    take: 50, // check top 50 for eligibility
  });

  const results = await Promise.all(
    scholarships.map(async (s) => {
      const eligibility = await checkEligibility(s.id, profile);
      return { scholarship: s, eligibility };
    }),
  );

  return results
    .filter(r => r.eligibility.status !== 'not_eligible')
    .sort((a, b) => b.eligibility.score - a.eligibility.score)
    .slice(0, limit);
}
