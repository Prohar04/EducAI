import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import prisma from '#src/config/database.ts';
import { toUSD } from '#src/utils/exchangeRates.ts';
import logger from '#src/config/logger.ts';

// ── Controllers ────────────────────────────────────────────────────────────────

/**
 * GET /users/profile
 * Retrieve the authenticated user's profile information.
 */
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.userId! },
    });
    res.status(200).json({ profile: profile ?? null });
  } catch (err) {
    logger.error(`[user:profile] Failed to fetch profile: ${err}`);
    res.status(500).json({ message: 'Unable to load your profile. Please try again.' });
  }
};

/**
 * PUT /users/profile
 * Create or update the authenticated user's profile with onboarding and preferences data.
 */
export const upsertUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as {
      // Legacy
      targetCountry?: string;
      level?: string;
      budgetRange?: string;
      intendedMajor?: string;
      gpa?: number;
      testScores?: Record<string, number>;
      onboardingDone?: boolean;
      // Step 1
      currentStage?: string;
      targetIntake?: string;
      targetCountries?: string[];
      intendedLevel?: string;
      // Step 2
      currentInstitution?: string;
      majorOrTrack?: string;
      gpaScale?: string;
      graduationYear?: number;
      backlogs?: number;
      workExperienceMonths?: number;
      // Step 3
      englishTestType?: string;
      englishScore?: number;
      gre?: number;
      gmat?: number;
      // Step 4
      budgetCurrency?: string;
      budgetMax?: number;
      fundingNeed?: boolean;
      preferredCities?: string[];
      priorities?: string[];
    };

    const data = {
      // Legacy
      ...(body.targetCountry !== undefined && { targetCountry: body.targetCountry }),
      ...(body.level !== undefined && { level: body.level }),
      ...(body.budgetRange !== undefined && { budgetRange: body.budgetRange }),
      ...(body.intendedMajor !== undefined && { intendedMajor: body.intendedMajor }),
      ...(body.gpa !== undefined && { gpa: body.gpa }),
      ...(body.testScores !== undefined && { testScores: body.testScores }),
      ...(body.onboardingDone !== undefined && { onboardingDone: body.onboardingDone }),
      // Step 1
      ...(body.currentStage !== undefined && { currentStage: body.currentStage }),
      ...(body.targetIntake !== undefined && { targetIntake: body.targetIntake }),
      ...(body.targetCountries !== undefined && { targetCountries: body.targetCountries }),
      ...(body.intendedLevel !== undefined && { intendedLevel: body.intendedLevel }),
      // Step 2
      ...(body.currentInstitution !== undefined && { currentInstitution: body.currentInstitution }),
      ...(body.majorOrTrack !== undefined && { majorOrTrack: body.majorOrTrack }),
      ...(body.gpaScale !== undefined && { gpaScale: body.gpaScale }),
      ...(body.graduationYear !== undefined && { graduationYear: body.graduationYear }),
      ...(body.backlogs !== undefined && { backlogs: body.backlogs }),
      ...(body.workExperienceMonths !== undefined && { workExperienceMonths: body.workExperienceMonths }),
      // Step 3
      ...(body.englishTestType !== undefined && { englishTestType: body.englishTestType }),
      ...(body.englishScore !== undefined && { englishScore: body.englishScore }),
      ...(body.gre !== undefined && { gre: body.gre }),
      ...(body.gmat !== undefined && { gmat: body.gmat }),
      // Step 4
      ...(body.budgetCurrency !== undefined && { budgetCurrency: body.budgetCurrency }),
      ...(body.budgetMax !== undefined && { budgetMax: body.budgetMax }),
      // Canonical USD-normalized budget — computed whenever both fields are present.
      // Only included in the update when we have a valid amount + currency pair.
      ...(body.budgetMax != null && body.budgetCurrency != null
        ? (() => {
            const usd = toUSD(body.budgetMax!, body.budgetCurrency!);
            return usd != null ? { budgetAmountUSD: usd } : {};
          })()
        : {}),
      ...(body.fundingNeed !== undefined && { fundingNeed: body.fundingNeed }),
      ...(body.preferredCities !== undefined && { preferredCities: body.preferredCities }),
      ...(body.priorities !== undefined && { priorities: body.priorities }),
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId: req.userId! },
      update: data,
      create: {
        userId: req.userId!,
        onboardingDone: false,
        ...data,
      },
    });

    res.status(200).json({ profile });
  } catch (err) {
    logger.error(`[user:upsert] Failed to save profile: ${err}`);
    res.status(500).json({ message: 'Could not save your profile. Please check your input and try again.' });
  }
};

