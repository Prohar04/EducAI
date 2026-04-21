/**
 * timeline.controller.ts
 *
 * Endpoints:
 *   GET   /timeline/inputs              — profile + saved programs + visa template
 *   POST  /timeline/generate            — build & persist UserRoadmap
 *   GET   /timeline/latest?countryCode= — latest UserRoadmap for a country
 *   PATCH /timeline/tasks               — update a single task status
 */
import { Response } from 'express';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import prisma from '#src/config/database.ts';
import { Prisma } from '../generated/client.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
type RoadmapItemType = 'preparation' | 'application' | 'scholarship' | 'visa' | 'deadline';

interface RoadmapItem {
  id: string;
  type: RoadmapItemType;
  title: string;
  description: string;
  date?: string;
  sourceId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedDuration?: string;
}

interface RoadmapMonth {
  month: string; // "YYYY-MM"
  label: string; // "September 2026"
  items: RoadmapItem[];
}

interface VisaMilestone {
  key: string;
  label: string;
  offsetDays: number; // negative = before anchor, e.g. -330 means 330 days before intake
  notes?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toYYYYMM(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Stable, URL-safe ID derived from content — survives regeneration. */
function makeTaskId(monthKey: string, qualifier: string): string {
  const slug = qualifier
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
  return `${monthKey}_${slug}`;
}

/** Auto-assign status at generation time: past tasks with no stored status = overdue. */
function resolveStatus(date: Date | undefined, now: Date): TaskStatus {
  if (!date) return 'pending';
  return date < now ? 'overdue' : 'pending';
}

// ── Roadmap Builder ───────────────────────────────────────────────────────────

/**
 * Builds a deterministic roadmap working backwards from an anchor date (earliest
 * program deadline or intake start). Visa milestone offsetDays are negative
 * (e.g. -330 = 330 days before anchor) so we ADD them to anchorDate.
 */
function buildRoadmap(
  anchorDate: Date,
  programDeadlines: { term: string; deadline: Date; programTitle: string; university: string; programId: string }[],
  scholarshipDeadlines: { term: string | null; deadline: Date; title: string; scholarshipId: string }[],
  visaMilestones: VisaMilestone[],
  previousStatuses: Map<string, TaskStatus>,
): RoadmapMonth[] {
  const now = new Date();

  // Window: 13 months before anchor → 3 months after
  const start = addMonths(anchorDate, -13);
  const end = addMonths(anchorDate, 3);

  const monthMap = new Map<string, RoadmapMonth>();

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

  const pushItem = (date: Date, item: Omit<RoadmapItem, 'status'>) => {
    const key = toYYYYMM(date);
    const slot = monthMap.get(key);
    if (!slot) return;
    const stored = previousStatuses.get(item.id);
    const status: TaskStatus = stored ?? resolveStatus(date, now);
    slot.items.push({ ...item, status });
  };

  // ── Generic planning phases ───────────────────────────────────────────────

  interface Phase {
    offsetMonths: number;
    items: Omit<RoadmapItem, 'id' | 'status' | 'date'>[];
  }

  const phases: Phase[] = [
    {
      offsetMonths: -13,
      items: [
        {
          type: 'preparation',
          title: 'Define your study-abroad goals',
          description: 'Clarify your target degree level, field, countries, and budget to focus your planning efforts.',
          priority: 'medium',
          estimatedDuration: '1 week',
        },
        {
          type: 'preparation',
          title: 'Research funding and scholarships',
          description: 'Identify scholarship opportunities and financial aid early — many deadlines run months before admission.',
          priority: 'high',
          estimatedDuration: '2 weeks',
        },
      ],
    },
    {
      offsetMonths: -12,
      items: [
        {
          type: 'preparation',
          title: 'Shortlist target programs',
          description: 'Research programs aligned with your profile, budget, and career goals across your target countries.',
          priority: 'high',
          estimatedDuration: '2–3 weeks',
        },
        {
          type: 'preparation',
          title: 'Start IELTS / TOEFL preparation',
          description: 'Enrol in a test prep course if needed. Target 7.0+ IELTS or 100+ TOEFL for competitive programs.',
          priority: 'high',
          estimatedDuration: '2–3 months',
        },
      ],
    },
    {
      offsetMonths: -10,
      items: [
        {
          type: 'preparation',
          title: 'Start GRE / GMAT preparation',
          description: 'Begin prep for any quantitative tests required by your target programs.',
          priority: 'high',
          estimatedDuration: '2–3 months',
        },
        {
          type: 'preparation',
          title: 'Contact referees for LOR',
          description: 'Reach out to professors or managers who will write your Letters of Recommendation. Give them 3+ months.',
          priority: 'high',
          estimatedDuration: '1 week',
        },
        {
          type: 'preparation',
          title: 'Request official transcripts',
          description: 'Start the transcript retrieval process from your institution — it can take weeks.',
          priority: 'high',
          estimatedDuration: '2–4 weeks',
        },
      ],
    },
    {
      offsetMonths: -8,
      items: [
        {
          type: 'preparation',
          title: 'Take English proficiency test',
          description: 'Sit IELTS, TOEFL, or equivalent to have official scores ready before applications open.',
          priority: 'critical',
          estimatedDuration: '1 day',
        },
        {
          type: 'preparation',
          title: 'Take GRE / GMAT',
          description: 'Sit the required quantitative test and ensure scores will be delivered to your target universities.',
          priority: 'critical',
          estimatedDuration: '1 day',
        },
        {
          type: 'preparation',
          title: 'Draft SOP outline',
          description: 'Create a structured outline for your Statement of Purpose covering motivation, background, and goals.',
          priority: 'high',
          estimatedDuration: '1–2 weeks',
        },
      ],
    },
    {
      offsetMonths: -6,
      items: [
        {
          type: 'application',
          title: 'Finalise SOP & personal statement',
          description: 'Complete polished, tailored SOPs for each program. Have them reviewed by a mentor or advisor.',
          priority: 'critical',
          estimatedDuration: '2–4 weeks',
        },
        {
          type: 'application',
          title: 'Update CV / résumé',
          description: 'Tailor your academic or professional CV to match each program\'s expectations.',
          priority: 'critical',
          estimatedDuration: '1 week',
        },
        {
          type: 'application',
          title: 'Open university application portals',
          description: 'Create accounts on each university\'s application system and begin filling out forms.',
          priority: 'critical',
          estimatedDuration: '1–2 weeks',
        },
      ],
    },
    {
      offsetMonths: -4,
      items: [
        {
          type: 'application',
          title: 'Submit all applications',
          description: 'Submit before each deadline. Follow up with referees on LOR submissions. Keep confirmation records.',
          priority: 'critical',
          estimatedDuration: '1–2 weeks',
        },
        {
          type: 'scholarship',
          title: 'Submit scholarship applications',
          description: 'Many scholarship deadlines fall before or at the same time as admission deadlines. Prioritise these.',
          priority: 'critical',
          estimatedDuration: '1–2 weeks',
        },
        {
          type: 'preparation',
          title: 'Follow up on outstanding LORs',
          description: 'Check that all referees have submitted their letters to your target universities.',
          priority: 'high',
          estimatedDuration: '1–2 days',
        },
      ],
    },
    {
      offsetMonths: -2,
      items: [
        {
          type: 'visa',
          title: 'Gather visa documents',
          description: 'Collect bank statements, financial guarantees, proof of admission, passport, and medical records as required.',
          priority: 'critical',
          estimatedDuration: '2–3 weeks',
        },
        {
          type: 'preparation',
          title: 'Research and apply for housing',
          description: 'Apply for university accommodation or shortlist private housing in your target city.',
          priority: 'medium',
          estimatedDuration: '1–2 weeks',
        },
        {
          type: 'preparation',
          title: 'Plan pre-departure finances',
          description: 'Arrange a travel-friendly bank card, health insurance, and initial living expenses for arrival.',
          priority: 'medium',
          estimatedDuration: '1 week',
        },
      ],
    },
    {
      offsetMonths: -1,
      items: [
        {
          type: 'visa',
          title: 'Book and attend visa appointment',
          description: 'Schedule a visa appointment at the consulate. Prepare for biometrics, interview, and document verification.',
          priority: 'critical',
          estimatedDuration: '1–2 weeks',
        },
        {
          type: 'preparation',
          title: 'Book flights',
          description: 'Confirm travel dates and book flights to arrive before orientation.',
          priority: 'high',
          estimatedDuration: '1–2 days',
        },
      ],
    },
    {
      offsetMonths: 0,
      items: [
        {
          type: 'preparation',
          title: 'Arrive and complete pre-registration',
          description: 'Complete all university arrival formalities, accommodation check-in, and document verification before intake.',
          priority: 'critical',
          estimatedDuration: '1 week',
        },
      ],
    },
    {
      offsetMonths: 1,
      items: [
        {
          type: 'preparation',
          title: 'University orientation & course registration',
          description: 'Attend orientation, register for courses, set up student services, and open a local bank account.',
          priority: 'low',
          estimatedDuration: '1–2 weeks',
        },
      ],
    },
  ];

  for (const phase of phases) {
    const phaseDate = addMonths(anchorDate, phase.offsetMonths);
    const monthKey = toYYYYMM(phaseDate);
    for (const item of phase.items) {
      const id = makeTaskId(monthKey, item.title);
      pushItem(phaseDate, { ...item, id, date: phaseDate.toISOString() });
    }
  }

  // ── Inject real program deadlines ─────────────────────────────────────────

  for (const pd of programDeadlines) {
    const monthKey = toYYYYMM(pd.deadline);
    const id = makeTaskId(monthKey, `deadline_${pd.programId}`);
    pushItem(pd.deadline, {
      id,
      type: 'deadline',
      title: `Application deadline — ${pd.programTitle}`,
      description: `Deadline (${pd.term}) for ${pd.programTitle} at ${pd.university}. Submit before this date.`,
      date: pd.deadline.toISOString(),
      sourceId: pd.programId,
      priority: 'critical',
    });
  }

  // ── Inject scholarship deadlines ──────────────────────────────────────────

  for (const sd of scholarshipDeadlines) {
    const monthKey = toYYYYMM(sd.deadline);
    const id = makeTaskId(monthKey, `scholarship_${sd.scholarshipId}`);
    pushItem(sd.deadline, {
      id,
      type: 'scholarship',
      title: `Scholarship deadline — ${sd.title}`,
      description: `Deadline${sd.term ? ` (${sd.term})` : ''} for ${sd.title}. Prepare materials well in advance.`,
      date: sd.deadline.toISOString(),
      sourceId: sd.scholarshipId,
      priority: 'critical',
    });
  }

  // ── Inject visa milestones ────────────────────────────────────────────────
  // offsetDays is negative (e.g. -330 = 330 days before anchor), so ADD to anchorDate.

  const VISA_MILESTONE_PRIORITY: Record<string, TaskPriority> = {
    shortlist: 'medium',
    tests: 'high',
    documents: 'high',
    apply: 'critical',
    scholarships: 'critical',
    visa_docs: 'critical',
    visa_submit: 'critical',
    interview: 'critical',
    housing: 'medium',
  };

  for (const vm of visaMilestones) {
    const vmDate = new Date(anchorDate.getTime() + vm.offsetDays * 24 * 60 * 60 * 1000);
    const monthKey = toYYYYMM(vmDate);
    const id = makeTaskId(monthKey, `visa_${vm.key}`);
    pushItem(vmDate, {
      id,
      type: 'visa',
      title: vm.label,
      description: vm.notes ?? '',
      date: vmDate.toISOString(),
      sourceId: vm.key,
      priority: VISA_MILESTONE_PRIORITY[vm.key] ?? 'medium',
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

    const savedProgramsCount = savedPrograms.length;
    const countryPrograms = countryCode
      ? savedPrograms.filter((sp) => sp.program.university.country.code === countryCode)
      : [];
    const savedWithDeadlinesCount = savedPrograms.filter(
      (sp) => sp.program.deadlines.length > 0,
    ).length;
    const missingDeadlinesCount = savedProgramsCount - savedWithDeadlinesCount;

    res.json({
      savedProgramsCount,
      savedWithDeadlinesCount,
      missingDeadlinesCount,
      savedPrograms,
      countryProgramsCount: countryPrograms.length,
      countryProgramsWithDeadlinesCount: countryPrograms.filter(
        (sp) => sp.program.deadlines.length > 0,
      ).length,
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
    const [profile, savedPrograms, scholarships, visaTemplate, prevRoadmap] = await Promise.all([
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
      prisma.userRoadmap.findFirst({
        where: { userId, countryCode },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!profile) {
      res.status(400).json({ message: 'Profile not found. Complete your profile first.' });
      return;
    }

    // Preserve completed/in-progress task statuses across regeneration
    const previousStatuses = new Map<string, TaskStatus>();
    if (prevRoadmap) {
      const prevPlan = prevRoadmap.plan as unknown as RoadmapMonth[];
      for (const month of prevPlan) {
        for (const item of month.items as RoadmapItem[]) {
          if (item.id && (item.status === 'completed' || item.status === 'in_progress')) {
            previousStatuses.set(item.id, item.status);
          }
        }
      }
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
        programId: sp.program.id,
      })),
    );

    // Determine anchor date: earliest program deadline → target intake → 12 months from now
    let anchorDate: Date;
    if (programDeadlines.length > 0) {
      // Use the latest (most recent) deadline as the anchor — the intake point
      // Sort ascending and pick earliest deadline as working anchor
      const sorted = [...programDeadlines].sort(
        (a, b) => a.deadline.getTime() - b.deadline.getTime(),
      );
      anchorDate = sorted[0].deadline;
    } else {
      const intakeStr = intake ?? profile.targetIntake ?? '';
      const fallMatch = intakeStr.match(/Fall\s+(\d{4})/i);
      const springMatch = intakeStr.match(/Spring\s+(\d{4})/i);
      const winterMatch = intakeStr.match(/Winter\s+(\d{4})/i);
      const summerMatch = intakeStr.match(/Summer\s+(\d{4})/i);

      if (fallMatch) {
        anchorDate = new Date(parseInt(fallMatch[1]), 8, 1); // Sep
      } else if (springMatch) {
        anchorDate = new Date(parseInt(springMatch[1]), 1, 1); // Feb
      } else if (winterMatch) {
        anchorDate = new Date(parseInt(winterMatch[1]), 0, 1); // Jan
      } else if (summerMatch) {
        anchorDate = new Date(parseInt(summerMatch[1]), 5, 1); // Jun
      } else {
        anchorDate = addMonths(new Date(), 12);
      }
    }

    // Scholarship deadlines
    const scholarshipDeadlines = scholarships.flatMap((s) =>
      s.deadlines.map((d) => ({
        term: d.term,
        deadline: d.deadline,
        title: s.title,
        scholarshipId: s.id,
      })),
    );

    // Visa milestones (offsetDays are negative = before anchor)
    const visaMilestones: VisaMilestone[] = visaTemplate
      ? ((visaTemplate.milestones as unknown) as VisaMilestone[])
      : [];

    const plan = buildRoadmap(
      anchorDate,
      programDeadlines,
      scholarshipDeadlines,
      visaMilestones,
      previousStatuses,
    );

    const programIds = countryPrograms.map((sp) => sp.program.id);
    const scholarshipIds = scholarships.map((s) => s.id);

    const roadmap = await prisma.userRoadmap.create({
      data: {
        userId,
        countryCode,
        intake: intake ?? profile.targetIntake ?? null,
        startMonth: plan.length > 0 ? plan[0].month : toYYYYMM(addMonths(anchorDate, -13)),
        endMonth: plan.length > 0 ? plan[plan.length - 1].month : toYYYYMM(addMonths(anchorDate, 3)),
        plan: plan as unknown as Prisma.InputJsonValue,
        sources: {
          programIds,
          scholarshipIds,
          visaTemplateId: visaTemplate?.id ?? null,
          anchorDate: anchorDate.toISOString(),
          generatedAt: new Date().toISOString(),
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

// ── PATCH /timeline/tasks ────────────────────────────────────────────────── //

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { roadmapId, taskId, status } = req.body as {
    roadmapId?: string;
    taskId?: string;
    status?: string;
  };

  const VALID_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'overdue'];

  if (!roadmapId || !taskId || !status) {
    res.status(400).json({ message: 'roadmapId, taskId, and status are required' });
    return;
  }

  if (!VALID_STATUSES.includes(status as TaskStatus)) {
    res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  try {
    const roadmap = await prisma.userRoadmap.findFirst({
      where: { id: roadmapId, userId },
    });

    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    const plan = roadmap.plan as unknown as RoadmapMonth[];
    let found = false;

    for (const month of plan) {
      for (const item of month.items as RoadmapItem[]) {
        if (item.id === taskId) {
          item.status = status as TaskStatus;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      res.status(404).json({ message: 'Task not found in roadmap' });
      return;
    }

    const updated = await prisma.userRoadmap.update({
      where: { id: roadmapId },
      data: { plan: plan as unknown as Prisma.InputJsonValue },
    });

    res.json(updated);
  } catch (err) {
    console.error('[timeline/tasks]', err);
    res.status(500).json({ message: 'Failed to update task status' });
  }
};
