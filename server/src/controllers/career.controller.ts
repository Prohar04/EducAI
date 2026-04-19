import type { Request, Response } from 'express';
import { predictCareerOutcome } from '#src/services/career.service.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

export async function careerPredictHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  try {
    const profileRecord = await prisma.userProfile.findUnique({ where: { userId } });

    if (!profileRecord) {
      res.status(404).json({ error: 'Profile not found. Please complete your profile first.' });
      return;
    }

    logger.info(`[career] predicting outcome for userId=${userId}`);

    const result = await predictCareerOutcome({
      intendedMajor: profileRecord.intendedMajor ?? undefined,
      intendedLevel: profileRecord.intendedLevel ?? undefined,
      targetCountries: (profileRecord.targetCountries as string[]) ?? undefined,
      workExperienceMonths: profileRecord.workExperienceMonths ?? undefined,
      gpa: profileRecord.gpa ?? undefined,
      gpaScale: profileRecord.gpaScale ?? undefined,
      englishTestType: profileRecord.englishTestType ?? undefined,
      englishScore: profileRecord.englishScore ?? undefined,
      currentStage: profileRecord.currentStage ?? undefined,
    });

    logger.info(`[career] outlook=${result.overallOutlook} score=${result.employabilityScore} for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[career] prediction failed for userId=${userId}: ${err}`);
    res.status(502).json({ error: 'Career prediction failed. Please try again.' });
  }
}
