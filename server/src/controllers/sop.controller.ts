import type { Request, Response } from 'express';
import { generateSop, type SopTone, type SopType } from '#src/services/sop.service.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

export async function sopGenerateHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  const {
    tone = 'formal',
    sopType = 'general',
    targetProgram,
    targetUniversity,
    targetCountry,
    targetIntake,
    highlights,
  } = req.body as {
    tone?: SopTone;
    sopType?: SopType;
    targetProgram?: string;
    targetUniversity?: string;
    targetCountry?: string;
    targetIntake?: string;
    highlights?: string;
  };

  const validTones: SopTone[] = ['formal', 'research', 'personal'];
  const validTypes: SopType[] = ['general', 'scholarship', 'research'];

  if (!validTones.includes(tone)) {
    res.status(400).json({ error: 'tone must be formal | research | personal' });
    return;
  }
  if (!validTypes.includes(sopType)) {
    res.status(400).json({ error: 'sopType must be general | scholarship | research' });
    return;
  }

  try {
    // Load user profile for context injection
    const profileRecord = await prisma.userProfile.findUnique({ where: { userId } });
    const profile = profileRecord;

    logger.info(`[sop] generating for userId=${userId} tone=${tone} type=${sopType}`);

    const result = await generateSop({
      name: undefined,
      currentDegree: profile?.currentStage ?? undefined,
      gpa: profile?.gpa ?? undefined,
      gpaScale: profile?.gpaScale ?? undefined,
      majorOrTrack: profile?.majorOrTrack ?? undefined,
      intendedMajor: profile?.intendedMajor ?? undefined,
      intendedLevel: profile?.intendedLevel ?? undefined,
      workExperienceMonths: profile?.workExperienceMonths ?? undefined,
      englishTestType: profile?.englishTestType ?? undefined,
      englishScore: profile?.englishScore ?? undefined,
      targetProgram,
      targetUniversity,
      targetCountry,
      targetIntake,
      tone,
      sopType,
      highlights,
    });

    logger.info(`[sop] generated ${result.wordCount} words for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[sop] generation failed: ${err}`);
    res.status(502).json({ error: 'SOP generation failed. Please try again.' });
  }
}
