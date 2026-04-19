import type { Request, Response } from 'express';
import { getImmigrationGuidance } from '#src/services/immigration.service.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

export async function immigrationGuideHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  try {
    const profileRecord = await prisma.userProfile.findUnique({ where: { userId } });

    if (!profileRecord) {
      res.status(404).json({ error: 'Profile not found. Please complete your profile first.' });
      return;
    }

    logger.info(`[immigration] generating guidance for userId=${userId}`);

    const result = await getImmigrationGuidance({
      targetCountries: (profileRecord.targetCountries as string[]) ?? undefined,
      intendedLevel: profileRecord.intendedLevel ?? undefined,
      intendedMajor: profileRecord.intendedMajor ?? undefined,
      workExperienceMonths: profileRecord.workExperienceMonths ?? undefined,
      englishTestType: profileRecord.englishTestType ?? undefined,
      englishScore: profileRecord.englishScore ?? undefined,
      currentStage: profileRecord.currentStage ?? undefined,
      fundingNeed: profileRecord.fundingNeed ?? undefined,
    });

    logger.info(`[immigration] bestFit=${result.bestFitCountry} pathways=${result.pathways.length} for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[immigration] failed for userId=${userId}: ${err}`);
    res.status(502).json({ error: 'Immigration guidance generation failed. Please try again.' });
  }
}
