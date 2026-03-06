import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import prisma from '#src/config/database.ts';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.userId! },
    });
    res.status(200).json({ profile: profile ?? null });
  } catch {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const upsertUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      targetCountry,
      level,
      budgetRange,
      intendedMajor,
      gpa,
      testScores,
      onboardingDone,
    } = req.body as {
      targetCountry?: string;
      level?: string;
      budgetRange?: string;
      intendedMajor?: string;
      gpa?: number;
      testScores?: Record<string, number>;
      onboardingDone?: boolean;
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId: req.userId! },
      update: {
        targetCountry,
        level,
        budgetRange,
        intendedMajor,
        gpa,
        testScores,
        onboardingDone,
      },
      create: {
        userId: req.userId!,
        targetCountry,
        level,
        budgetRange,
        intendedMajor,
        gpa,
        testScores,
        onboardingDone: onboardingDone ?? false,
      },
    });

    res.status(200).json({ profile });
  } catch {
    res.status(500).json({ message: 'Failed to save profile' });
  }
};
