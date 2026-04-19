import type { Request, Response } from 'express';
import { generateGapFix } from '#src/services/gapfix.service.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

export async function gapFixGenerateHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  try {
    const profileRecord = await prisma.userProfile.findUnique({ where: { userId } });

    if (!profileRecord) {
      res.status(404).json({ error: 'Profile not found. Please complete your profile first.' });
      return;
    }

    logger.info(`[gapfix] generating recommendations for userId=${userId}`);

    const result = await generateGapFix({
      gpa: profileRecord.gpa ?? undefined,
      gpaScale: profileRecord.gpaScale ?? undefined,
      backlogs: profileRecord.backlogs ?? undefined,
      graduationYear: profileRecord.graduationYear ?? undefined,
      englishTestType: profileRecord.englishTestType ?? undefined,
      englishScore: profileRecord.englishScore ?? undefined,
      gre: profileRecord.gre ?? undefined,
      gmat: profileRecord.gmat ?? undefined,
      workExperienceMonths: profileRecord.workExperienceMonths ?? undefined,
      intendedLevel: profileRecord.intendedLevel ?? undefined,
      intendedMajor: profileRecord.intendedMajor ?? undefined,
      targetCountries: (profileRecord.targetCountries as string[]) ?? undefined,
      targetIntake: profileRecord.targetIntake ?? undefined,
      currentStage: profileRecord.currentStage ?? undefined,
      fundingNeed: profileRecord.fundingNeed ?? undefined,
    });

    logger.info(`[gapfix] score=${result.profileScore} gaps=${result.weaknesses.length} for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[gapfix] failed for userId=${userId}: ${err}`);
    res.status(502).json({ error: 'Gap analysis failed. Please try again.' });
  }
}
