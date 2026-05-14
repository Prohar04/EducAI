import type { Request, Response } from 'express';
import { generateResume, type ResumeTemplate } from '#src/services/resume.service.ts';
import { generatePDF } from '#src/services/pdfGeneratorService.ts';
import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

const VALID_TEMPLATES: ResumeTemplate[] = [
  'ats-clean', 'google-faang', 'startup-tech',
  'executive-professional', 'data-science', 'consulting-finance',
];

export async function resumeGenerateHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as unknown as { userId: string }).userId;

  const {
    resumeTemplate = 'ats-clean',
    location,
    phone,
    linkedin,
    github,
    portfolio,
    summary,
    targetRole,
    targetCompany,
    targetIndustry,
    workExperience,
    internships,
    education,
    technicalSkills,
    softSkills,
    projects,
    certifications,
    achievements,
    languages,
    volunteering,
    highlights,
  } = req.body as {
    resumeTemplate?: ResumeTemplate;
    location?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary?: string;
    targetRole?: string;
    targetCompany?: string;
    targetIndustry?: string;
    workExperience?: string;
    internships?: string;
    education?: string;
    technicalSkills?: string;
    softSkills?: string;
    projects?: string;
    certifications?: string;
    achievements?: string;
    languages?: string;
    volunteering?: string;
    highlights?: string;
  };

  if (!VALID_TEMPLATES.includes(resumeTemplate)) {
    res.status(400).json({ error: `resumeTemplate must be one of: ${VALID_TEMPLATES.join(' | ')}` });
    return;
  }

  try {
    const [profile, user] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    ]);

    logger.info(`[resume] generating for userId=${userId} template=${resumeTemplate}`);

    const result = await generateResume({
      name: user?.name ?? undefined,
      email: user?.email ?? undefined,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      summary,
      targetRole,
      targetCompany,
      targetIndustry,
      workExperience,
      internships,
      education: education ?? (profile?.currentInstitution ? `${profile.majorOrTrack ?? ''} at ${profile.currentInstitution}` : undefined),
      technicalSkills,
      softSkills,
      projects,
      certifications,
      achievements,
      languages,
      volunteering,
      highlights,
      resumeTemplate,
    });

    logger.info(`[resume] generated for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[resume] generation failed: ${err}`);
    res.status(502).json({ error: 'Resume generation failed. Please try again.' });
  }
}

export async function resumeDownloadPdfHandler(req: Request, res: Response): Promise<void> {
  try {
    const { content, template = 'ats-clean' } = req.body as { content: string; template?: string };
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'content is required' });
      return;
    }
    const pdfBuffer = await generatePDF({
      content,
      documentType: 'resume',
      template,
      authorName: 'Applicant',
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Resume-${new Date().toISOString().slice(0, 10)}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    logger.error(`[resume] PDF generation failed: ${err}`);
    res.status(500).json({ error: 'PDF generation failed' });
  }
}
