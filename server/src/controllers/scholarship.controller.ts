import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  searchScholarships,
  getScholarshipById,
  getUpcomingDeadlines,
  checkEligibility,
  predictFundingProbability,
  getEligibleScholarships,
} from '#src/services/scholarship.service.ts';
import { runLiveScholarshipRefresh } from '#src/services/liveScholarship.service.ts';
import prisma from '#src/config/database.ts';

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getUserProfile(userId: string) {
  return prisma.userProfile.findUnique({ where: { userId } });
}

// ── Controllers ────────────────────────────────────────────────────────────────

const SearchQuerySchema = z.object({
  q: z.string().optional(),
  countryCode: z.string().max(10).optional(),
  level: z.enum(['BSC', 'MSC', 'PHD']).optional(),
  field: z.string().max(100).optional(),
  fundingType: z.enum(['full', 'partial', 'living', 'research']).optional(),
  financialNeed: z.string().optional(), // "true" | "false"
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export async function listScholarships(req: Request & { userId?: string }, res: Response) {
  const parsed = SearchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid query parameters', errors: parsed.error.flatten() });
    return;
  }

  const { q, countryCode, level, field, fundingType, financialNeed, page, limit } = parsed.data;

  try {
    // Optionally load user profile for personalised ranking
    const userProfile = req.userId ? await getUserProfile(req.userId) : null;

    const result = await searchScholarships({
      q,
      countryCode,
      level,
      field,
      fundingType,
      financialNeed: financialNeed === 'true' ? true : undefined,
      page,
      limit,
      userProfile: userProfile
        ? {
          intendedLevel: userProfile.intendedLevel,
          intendedMajor: userProfile.intendedMajor,
          majorOrTrack: userProfile.majorOrTrack,
          targetCountries: userProfile.targetCountries as string[] | null,
          fundingNeed: userProfile.fundingNeed,
          gpa: userProfile.gpa,
          gpaScale: userProfile.gpaScale,
        }
        : null,
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('[scholarship:list]', err);
    res.status(500).json({ message: 'Failed to fetch scholarships' });
  }
}

export async function getScholarship(req: Request & { userId?: string }, res: Response) {
  const id = String(req.params.id);
  try {
    const scholarship = await getScholarshipById(id);
    if (!scholarship) {
      res.status(404).json({ message: 'Scholarship not found' });
      return;
    }
    res.status(200).json(scholarship);
  } catch (err) {
    console.error('[scholarship:get]', err);
    res.status(500).json({ message: 'Failed to fetch scholarship' });
  }
}

export async function listUpcomingDeadlines(req: Request & { userId?: string }, res: Response) {
  const daysAhead = Number(req.query.daysAhead ?? 90);
  try {
    const deadlines = await getUpcomingDeadlines(isNaN(daysAhead) ? 90 : daysAhead);
    res.status(200).json({ deadlines });
  } catch (err) {
    console.error('[scholarship:deadlines]', err);
    res.status(500).json({ message: 'Failed to fetch upcoming deadlines' });
  }
}

export async function listEligibleScholarships(req: Request & { userId?: string }, res: Response) {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorised' });
    return;
  }
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      res.status(200).json({ items: [], message: 'Complete your profile for personalised eligibility' });
      return;
    }
    const results = await getEligibleScholarships({
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      englishTestType: profile.englishTestType,
      englishScore: profile.englishScore,
      fundingNeed: profile.fundingNeed,
      level: profile.level,
      intendedLevel: profile.intendedLevel,
      majorOrTrack: profile.majorOrTrack,
      intendedMajor: profile.intendedMajor,
      workExperienceMonths: profile.workExperienceMonths,
      graduationYear: profile.graduationYear,
      targetCountries: profile.targetCountries as string[] | null,
    });
    res.status(200).json({ items: results });
  } catch (err) {
    console.error('[scholarship:eligible]', err);
    res.status(500).json({ message: 'Failed to compute eligible scholarships' });
  }
}

const EligibilityBodySchema = z.object({
  profileOverride: z
    .object({
      gpa: z.number().optional(),
      gpaScale: z.string().optional(),
      englishTestType: z.string().optional(),
      englishScore: z.number().optional(),
      fundingNeed: z.boolean().optional(),
      intendedLevel: z.string().optional(),
    })
    .optional(),
});

export async function checkScholarshipEligibility(
  req: Request & { userId?: string },
  res: Response,
) {
  const id = String(req.params.id);
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorised' });
    return;
  }

  const parsed = EligibilityBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid body', errors: parsed.error.flatten() });
    return;
  }

  try {
    const profile = await getUserProfile(userId);
    const mergedProfile = {
      gpa: parsed.data.profileOverride?.gpa ?? profile?.gpa,
      gpaScale: parsed.data.profileOverride?.gpaScale ?? profile?.gpaScale,
      englishTestType: parsed.data.profileOverride?.englishTestType ?? profile?.englishTestType,
      englishScore: parsed.data.profileOverride?.englishScore ?? profile?.englishScore,
      fundingNeed: parsed.data.profileOverride?.fundingNeed ?? profile?.fundingNeed,
      level: profile?.level,
      intendedLevel: parsed.data.profileOverride?.intendedLevel ?? profile?.intendedLevel,
      majorOrTrack: profile?.majorOrTrack,
      intendedMajor: profile?.intendedMajor,
      workExperienceMonths: profile?.workExperienceMonths,
      graduationYear: profile?.graduationYear,
      targetCountries: profile?.targetCountries as string[] | null,
    };

    const result = await checkEligibility(id, mergedProfile);
    res.status(200).json(result);
  } catch (err) {
    console.error('[scholarship:eligibility]', err);
    res.status(500).json({ message: 'Failed to check eligibility' });
  }
}

export async function refreshScholarships(
  req: Request & { userId?: string },
  res: Response,
) {
  try {
    const result = await runLiveScholarshipRefresh({ force: true });
    res.status(200).json(result);
  } catch (err) {
    console.error('[scholarship:refresh]', err);
    res.status(500).json({ message: 'Live scholarship refresh failed' });
  }
}

export async function getScholarshipProbability(
  req: Request & { userId?: string },
  res: Response,
) {
  const id = String(req.params.id);
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorised' });
    return;
  }

  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      res.status(200).json({
        scholarshipId: id,
        probabilityBand: 'Low',
        probabilityPct: 20,
        factors: [],
        weaknesses: ['Complete your profile for a real assessment'],
        improvementActions: ['Go to Settings → Profile to fill in your academic details'],
        confidence: 'low',
      });
      return;
    }

    const result = await predictFundingProbability(id, {
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      englishTestType: profile.englishTestType,
      englishScore: profile.englishScore,
      fundingNeed: profile.fundingNeed,
      level: profile.level,
      intendedLevel: profile.intendedLevel,
      majorOrTrack: profile.majorOrTrack,
      intendedMajor: profile.intendedMajor,
      workExperienceMonths: profile.workExperienceMonths,
      graduationYear: profile.graduationYear,
      targetCountries: profile.targetCountries as string[] | null,
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('[scholarship:probability]', err);
    res.status(500).json({ message: 'Failed to compute funding probability' });
  }
}
