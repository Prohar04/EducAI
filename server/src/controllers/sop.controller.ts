import type { Request, Response } from 'express';
import { generateSop, type SopTemplate, type SopTone, type SopType } from '#src/services/sop.service.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

const VALID_TEMPLATES: SopTemplate[] = [
  'formal-academic', 'research-focused', 'scholarship-focused', 'personal-story',
  'professional-career', 'technical-engineering', 'business-management',
  'compact-direct', 'highly-persuasive', 'phd-proposal',
];

export async function sopGenerateHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  const {
    sopTemplate = 'formal-academic',
    targetProgram,
    targetUniversity,
    targetCountry,
    targetIntake,
    degreeLevel,
    highlights,
    // Rich user-provided context
    sopPurpose,
    academicBackground,
    motivation,
    whySubject,
    whyUniversity,
    whyCountry,
    careerGoals,
    researchInterests,
    achievements,
    workExperience,
    projects,
    challengesOvercome,
    scholarshipAngle,
    // Legacy
    tone,
    sopType,
  } = req.body as {
    sopTemplate?: SopTemplate;
    targetProgram?: string;
    targetUniversity?: string;
    targetCountry?: string;
    targetIntake?: string;
    degreeLevel?: string;
    highlights?: string;
    sopPurpose?: string;
    academicBackground?: string;
    motivation?: string;
    whySubject?: string;
    whyUniversity?: string;
    whyCountry?: string;
    careerGoals?: string;
    researchInterests?: string;
    achievements?: string;
    workExperience?: string;
    projects?: string;
    challengesOvercome?: string;
    scholarshipAngle?: string;
    tone?: SopTone;
    sopType?: SopType;
  };

  if (!VALID_TEMPLATES.includes(sopTemplate)) {
    res.status(400).json({ error: `sopTemplate must be one of: ${VALID_TEMPLATES.join(' | ')}` });
    return;
  }

  try {
    const profileRecord = await prisma.userProfile.findUnique({ where: { userId } });

    logger.info(`[sop] generating for userId=${userId} template=${sopTemplate}`);

    const result = await generateSop({
      currentDegree: profileRecord?.currentStage ?? undefined,
      gpa: profileRecord?.gpa ?? undefined,
      gpaScale: profileRecord?.gpaScale ?? undefined,
      majorOrTrack: profileRecord?.majorOrTrack ?? undefined,
      intendedMajor: profileRecord?.intendedMajor ?? undefined,
      intendedLevel: profileRecord?.intendedLevel ?? undefined,
      workExperienceMonths: profileRecord?.workExperienceMonths ?? undefined,
      englishTestType: profileRecord?.englishTestType ?? undefined,
      englishScore: profileRecord?.englishScore ?? undefined,
      targetProgram,
      targetUniversity,
      targetCountry,
      targetIntake,
      degreeLevel,
      sopTemplate,
      highlights,
      sopPurpose,
      academicBackground,
      motivation,
      whySubject,
      whyUniversity,
      whyCountry,
      careerGoals,
      researchInterests,
      achievements,
      workExperience,
      projects,
      challengesOvercome,
      scholarshipAngle,
      tone,
      sopType,
    });

    logger.info(`[sop] generated ${result.wordCount} words for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[sop] generation failed: ${err}`);
    res.status(502).json({ error: 'SOP generation failed. Please try again.' });
  }
}
