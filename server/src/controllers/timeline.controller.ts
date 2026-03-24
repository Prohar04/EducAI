/**
 * timeline.controller.ts
 *
 * Endpoints:
 *   GET  /timeline/inputs              — profile + saved programs + visa template
 *   POST /timeline/generate            — build & persist UserRoadmap (deterministic)
 *   GET  /timeline/latest?countryCode= — latest UserRoadmap for a country
 */
import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import prisma from '#src/config/database.ts';
import { Prisma } from '../generated/client.ts';

// ── Helpers ──────────────────────────────────────────────────────────────────

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toYYYYMM(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

interface RoadmapItem {
  type: 'preparation' | 'application' | 'scholarship' | 'visa' | 'deadline';
  title: string;
  description: string;
  date?: string; // ISO date string
  sourceId?: string;
}

interface RoadmapMonth {
  month: string; // "YYYY-MM"
  label: string; // "September 2026"
  items: RoadmapItem[];
}

interface VisaMilestone {
  key: string;
  label: string;
  offsetDays: number;
  notes?: string;
}

/** Deterministic roadmap builder: works backwards from anchor deadline. */
function buildRoadmap(
  anchorDate: Date,
  programDeadlines: { term: string; deadline: Date; programTitle: string; university: string }[],
  scholarshipDeadlines: { term: string | null; deadline: Date; title: string }[],
  visaMilestones: VisaMilestone[],
): RoadmapMonth[] {
  // Range: 12 months before anchor → 3 months after
  const start = addMonths(anchorDate, -12);
  const end = addMonths(anchorDate, 3);

  const monthMap = new Map<string, RoadmapMonth>();

  // Populate skeleton months
  let cur = new Date(start);
  while (cur <= end) {
    const key = toYYYYMM(cur);
    monthMap.set(key, {
      month: key,
      label: cur.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      items: [],
    });
    cur = addMonths(cur, 1);
  }

  const pushItem = (date: Date, item: RoadmapItem) => {
    const key = toYYYYMM(date);
    const slot = monthMap.get(key);
    if (slot) slot.items.push(item);
  };

  // Phase items anchored to relative months from anchor
  const phases: { offsetMonths: number; items: RoadmapItem[] }[] = [
    {
      offsetMonths: -12,
      items: [
        { type: 'preparation', title: 'Begin shortlisting programs', description: 'Research programs aligned with your profile and budget in your target countries.' },
        { type: 'preparation', title: 'IELTS / GRE prep', description: 'Enrol in a test prep course if scores need improvement. Target 7.0+ IELTS or 315+ GRE.' },
      ],
    },
    {
      offsetMonths: -10,
      items: [
        { type: 'preparation', title: 'Contact referees for LOR', description: 'Reach out to professors or managers who will write your Letters of Recommendation.' },
        { type: 'preparation', title: 'Request official transcripts', description: 'Start the transcript retrieval process from your current/past institution.' },
      ],
    },
    {
      offsetMonths: -8,
      items: [
        { type: 'preparation', title: 'Take English / GRE test', description: 'Sit the required standardised tests to have official scores in hand before applications open.' },
        { type: 'preparation', title: 'Draft SOP outline', description: 'Create a structured outline of your Statement of Purpose covering motivation, background, and goals.' },
      ],
    },
    {
      offsetMonths: -6,
      items: [
        { type: 'application', title: 'Finalise SOP & CV', description: 'Complete polished drafts of your SOP and CV tailored to each target program.' },
        { type: 'application', title: 'Start online applications', description: 'Open portal accounts on university application systems and begin filling out forms.' },
      ],
    },
    {
      offsetMonths: -4,
      items: [
        { type: 'application', title: 'Submit applications', description: 'Ensure all applications are submitted well before deadlines. Follow up on LOR submissions.' },
        { type: 'scholarship', title: 'Apply for scholarships', description: 'Submit scholarship applications — many have earlier deadlines than admission.' },
      ],
    },
    {
      offsetMonths: -2,
      items: [
        { type: 'visa', title: 'Gather visa documents', description: 'Collect bank statements, financial guarantees, and proof of admission for visa application.' },
        { type: 'preparation', title: 'Research housing options', description: 'Apply for university accommodation or shortlist private housing in your target city.' },
      ],
    },
    {
      offsetMonths: -1,
      items: [
        { type: 'visa', title: 'Book visa appointment', description: 'Schedule a visa appointment at the consulate. Prepare for biometrics and interview.' },
      ],
    },
    {
      offsetMonths: 0,
      items: [
        { type: 'visa', title: 'Intake starts', description: 'Program intake begins. Ensure all pre-arrival documentation is complete.' },
      ],
    },
    {
      offsetMonths: 1,
      items: [
        { type: 'preparation', title: 'Orientation & registration', description: 'Attend university orientation, complete course registration, and set up bank account.' },
      ],
    },
  ];

  for (const phase of phases) {
    const phaseDate = addMonths(anchorDate, phase.offsetMonths);
    for (const item of phase.items) {
      pushItem(phaseDate, { ...item, date: phaseDate.toISOString() });
    }
  }

  // Inject real program deadlines
  for (const pd of programDeadlines) {
    pushItem(pd.deadline, {
      type: 'deadline',
      title: `Deadline: ${pd.programTitle}`,
      description: `Application deadline (${pd.term}) for ${pd.programTitle} at ${pd.university}.`,
      date: pd.deadline.toISOString(),
    });
  }

  // Inject scholarship deadlines
  for (const sd of scholarshipDeadlines) {
    pushItem(sd.deadline, {
      type: 'scholarship',
      title: `Scholarship: ${sd.title}`,
      description: `Application deadline${sd.term ? ` (${sd.term})` : ''} for ${sd.title}.`,
      date: sd.deadline.toISOString(),
    });
  }

  // Inject visa milestones relative to anchor
  for (const vm of visaMilestones) {
    const vmDate = new Date(anchorDate.getTime() - vm.offsetDays * 24 * 60 * 60 * 1000);
    pushItem(vmDate, {
      type: 'visa',
      title: vm.label,
      description: vm.notes ?? '',
      date: vmDate.toISOString(),
      sourceId: vm.key,
    });
  }

  return Array.from(monthMap.values()).filter((m) => m.items.length > 0);
}

// ── GET /timeline/inputs ──────────────────────────────────────────────────── //

export const getTimelineInputs = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const countryCode = (req.query.countryCode as string | undefined) ?? null;

  try {
    const [profile, savedPrograms, visaTemplate, scholarships] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.savedProgram.findMany({
        where: { userId },
        include: {
          program: {
            include: {
              university: { include: { country: true } },
              deadlines: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      countryCode
        ? prisma.visaTimelineTemplate.findUnique({ where: { countryCode } })
        : null,
      countryCode
        ? prisma.scholarship.findMany({
            where: { countryCode },
            include: { deadlines: true },
            take: 20,
          })
        : [],
    ]);

    // Compute counts for clarity
    const savedProgramsCount = savedPrograms.length;
    const savedWithDeadlinesCount = savedPrograms.filter(
      (sp) => sp.program.deadlines.length > 0
    ).length;
    const missingDeadlinesCount = savedProgramsCount - savedWithDeadlinesCount;

    res.json({
      savedProgramsCount,
      savedWithDeadlinesCount,
      missingDeadlinesCount,
      savedPrograms,
      visaTemplateAvailable: Boolean(visaTemplate),
      profile,
      scholarships,
    });
  } catch (err) {
    console.error('[timeline/inputs]', err);
    res.status(500).json({ message: 'Failed to fetch timeline inputs' });
  }
};

// ── POST /timeline/generate ───────────────────────────────────────────────── //

export const generateTimeline = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { countryCode, intake } = req.body as { countryCode?: string; intake?: string };

  if (!countryCode) {
    res.status(400).json({ message: 'countryCode is required' });
    return;
  }

  try {
    const [profile, savedPrograms, scholarships, visaTemplate] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.savedProgram.findMany({
        where: { userId },
        include: {
          program: {
            include: {
              university: { include: { country: true } },
              deadlines: true,
            },
          },
        },
      }),
      prisma.scholarship.findMany({
        where: { countryCode },
        include: { deadlines: true },
        take: 20,
      }),
      prisma.visaTimelineTemplate.findUnique({ where: { countryCode } }),
    ]);

    if (!profile) {
      res.status(400).json({ message: 'Profile not found. Complete your profile first.' });
      return;
    }

    // Filter saved programs by country
    const countryPrograms = savedPrograms.filter(
      (sp) => sp.program.university.country.code === countryCode,
    );

    // Collect real program deadlines
    const programDeadlines = countryPrograms.flatMap((sp) =>
      sp.program.deadlines.map((d) => ({
        term: d.term,
        deadline: d.deadline,
        programTitle: sp.program.title,
        university: sp.program.university.name,
      })),
    );

    // Determine anchor date: earliest program deadline or target-intake-derived date
    let anchorDate: Date;
    if (programDeadlines.length > 0) {
      anchorDate = programDeadlines.reduce((min, d) =>
        d.deadline < min ? d.deadline : min,
        programDeadlines[0].deadline,
      );
    } else {
      // Derive from intake string (e.g. "Fall 2027" → September 2027)
      const intakeStr = intake ?? profile.targetIntake ?? '';
      const fallMatch = intakeStr.match(/Fall\s+(\d{4})/i);
      const springMatch = intakeStr.match(/Spring\s+(\d{4})/i);
      if (fallMatch) {
        anchorDate = new Date(parseInt(fallMatch[1]), 8, 1); // Sep
      } else if (springMatch) {
        anchorDate = new Date(parseInt(springMatch[1]), 1, 1); // Feb
      } else {
        // Default: 12 months from now
        anchorDate = addMonths(new Date(), 12);
      }
    }

    // Scholarship deadlines
    const scholarshipDeadlines = scholarships.flatMap((s) =>
      s.deadlines.map((d) => ({
        term: d.term,
        deadline: d.deadline,
        title: s.title,
      })),
    );

    // Visa milestones
    const visaMilestones: VisaMilestone[] = visaTemplate
      ? ((visaTemplate.milestones as unknown) as VisaMilestone[])
      : [];

    const plan = buildRoadmap(anchorDate, programDeadlines, scholarshipDeadlines, visaMilestones);

    const programIds = countryPrograms.map((sp) => sp.program.id);
    const scholarshipIds = scholarships.map((s) => s.id);

    const roadmap = await prisma.userRoadmap.create({
      data: {
        userId,
        countryCode,
        intake: intake ?? profile.targetIntake ?? null,
        startMonth: plan.length > 0 ? plan[0].month : toYYYYMM(addMonths(anchorDate, -12)),
        endMonth: plan.length > 0 ? plan[plan.length - 1].month : toYYYYMM(addMonths(anchorDate, 3)),
        plan: plan as unknown as Prisma.InputJsonValue,
        sources: {
          programIds,
          scholarshipIds,
          visaTemplateId: visaTemplate?.id ?? null,
        },
      },
    });

    res.json(roadmap);
  } catch (err) {
    console.error('[timeline/generate]', err);
    res.status(500).json({ message: 'Failed to generate timeline' });
  }
};

// ── GET /timeline/latest ─────────────────────────────────────────────────── //

export const getLatestTimeline = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const countryCode = req.query.countryCode as string | undefined;

  try {
    const where = countryCode ? { userId, countryCode } : { userId };
    const roadmap = await prisma.userRoadmap.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (!roadmap) {
      res.status(404).json({ message: 'No roadmap found. Generate one first.' });
      return;
    }

    res.json(roadmap);
  } catch (err) {
    console.error('[timeline/latest]', err);
    res.status(500).json({ message: 'Failed to fetch roadmap' });
  }
};
