import type { Request, Response } from 'express';
import { generateCv, type CvTemplate } from '#src/services/cv.service.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

const VALID_TEMPLATES: CvTemplate[] = [
  'minimal-academic', 'research-focused', 'modern-professional', 'scholarship-focused',
  'international-student', 'technical-engineering', 'business-management',
  'clean-classic', 'compact-one-page', 'phd-research',
];

export async function cvGenerateHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  const {
    cvTemplate = 'minimal-academic',
    highlights,
    // Rich user-provided fields
    phone,
    linkedin,
    github,
    summary,
    thesisOrResearch,
    publications,
    workExperience,
    internships,
    technicalSkills,
    softSkills,
    projects,
    certifications,
    awards,
    extracurriculars,
    volunteering,
    references,
    targetDegree,
    targetCountry: bodyTargetCountry,
    targetUniversity,
    targetProgram,
  } = req.body as {
    cvTemplate?: CvTemplate;
    highlights?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    summary?: string;
    thesisOrResearch?: string;
    publications?: string;
    workExperience?: string;
    internships?: string;
    technicalSkills?: string;
    softSkills?: string;
    projects?: string;
    certifications?: string;
    awards?: string;
    extracurriculars?: string;
    volunteering?: string;
    references?: string;
    targetDegree?: string;
    targetCountry?: string;
    targetUniversity?: string;
    targetProgram?: string;
  };

  if (!VALID_TEMPLATES.includes(cvTemplate)) {
    res.status(400).json({ error: `cvTemplate must be one of: ${VALID_TEMPLATES.join(' | ')}` });
    return;
  }

  try {
    const [profile, user] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    ]);

    logger.info(`[cv] generating for userId=${userId} template=${cvTemplate}`);

    const result = await generateCv({
      name: user?.name ?? undefined,
      email: user?.email ?? undefined,
      phone,
      linkedin,
      github,
      summary,
      targetDegree,
      targetCountry: bodyTargetCountry ?? (profile?.targetCountries as string[] | null)?.[0] ?? undefined,
      targetUniversity,
      targetProgram,
      currentDegree: profile?.currentStage ?? undefined,
      currentInstitution: profile?.currentInstitution ?? undefined,
      majorOrTrack: profile?.majorOrTrack ?? undefined,
      gpa: profile?.gpa ?? undefined,
      gpaScale: profile?.gpaScale ?? undefined,
      graduationYear: profile?.graduationYear ?? undefined,
      thesisOrResearch,
      publications,
      englishTestType: profile?.englishTestType ?? undefined,
      englishScore: profile?.englishScore ?? undefined,
      gre: profile?.gre ?? undefined,
      gmat: profile?.gmat ?? undefined,
      workExperienceMonths: profile?.workExperienceMonths ?? undefined,
      workExperience,
      internships,
      technicalSkills,
      softSkills,
      projects,
      certifications,
      awards,
      extracurriculars,
      volunteering,
      references,
      intendedLevel: profile?.intendedLevel ?? undefined,
      intendedMajor: profile?.intendedMajor ?? undefined,
      highlights,
      cvTemplate,
    });

    logger.info(`[cv] generated for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[cv] generation failed: ${err}`);
    res.status(502).json({ error: 'CV generation failed. Please try again.' });
  }
}
