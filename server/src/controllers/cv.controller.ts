import type { Request, Response } from 'express';
import { generateCv } from '#src/services/cv.service.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

type CvStyle = 'academic' | 'research' | 'industry';

export async function cvGenerateHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  const { cvStyle = 'academic', highlights } = req.body as { cvStyle?: CvStyle; highlights?: string };

  const validStyles: CvStyle[] = ['academic', 'research', 'industry'];
  if (!validStyles.includes(cvStyle)) {
    res.status(400).json({ error: 'cvStyle must be academic | research | industry' });
    return;
  }

  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    logger.info(`[cv] generating for userId=${userId} style=${cvStyle}`);

    const result = await generateCv({
      name: undefined,
      currentDegree: profile?.currentStage ?? undefined,
      currentInstitution: profile?.currentInstitution ?? undefined,
      majorOrTrack: profile?.majorOrTrack ?? undefined,
      gpa: profile?.gpa ?? undefined,
      gpaScale: profile?.gpaScale ?? undefined,
      graduationYear: profile?.graduationYear ?? undefined,
      englishTestType: profile?.englishTestType ?? undefined,
      englishScore: profile?.englishScore ?? undefined,
      gre: profile?.gre ?? undefined,
      gmat: profile?.gmat ?? undefined,
      workExperienceMonths: profile?.workExperienceMonths ?? undefined,
      intendedLevel: profile?.intendedLevel ?? undefined,
      intendedMajor: profile?.intendedMajor ?? undefined,
      targetCountry: (profile?.targetCountries as string[] | null)?.[0] ?? undefined,
      highlights,
      cvStyle,
    });

    logger.info(`[cv] generated for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[cv] generation failed: ${err}`);
    res.status(502).json({ error: 'CV generation failed. Please try again.' });
  }
}
