import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserProfile, getMatchLatest, getSavedPrograms, getLatestTimeline } from "@/lib/auth/action";
import { fetchEducationPulse, type FeedItem } from "@/lib/data/fetchEducationPulse";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Bookmark,
  Clock,
  Calendar,
  TrendingUp,
  MapPin,
  ArrowRight,
  DollarSign,
  Award,
  Globe,
  ExternalLink,
  Target,
  ChevronRight,
  FileText,
  Briefcase,
  Users,
  Zap,
} from "lucide-react";
import type { SavedProgramItem, MatchLatestResponse, UserProfile, Session } from "@/types/auth.type";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { RevealAnimation } from "@/components/ui/reveal-animation";
import { StatusBadge } from "@/components/shared/status-badge";
import { DynamicGreeting } from "@/components/app/DynamicGreeting";
import HeroVisual from "@/components/ui/hero-visual";
import DashboardAnimation from "@/components/animations/dashboard-animation";

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────

type DeadlineItem = {
  id: string;
  title: string;
  date: string;
  type: "application" | "scholarship" | "visa" | "test";
  priority: "high" | "medium" | "low";
};

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

function getTargetCountriesDisplay(targetCountries: unknown): string | null {
  try {
    if (Array.isArray(targetCountries)) return targetCountries.join(", ");
    if (typeof targetCountries === "string") return JSON.parse(targetCountries).join(", ");
  } catch {}
  return null;
}

function getProfileCompleteness(profile: UserProfile): number {
  const fields = [
    profile.currentStage, profile.targetIntake, profile.intendedLevel,
    profile.intendedMajor, profile.targetCountries, profile.gpa,
    profile.englishTestType, profile.budgetMax,
  ];
  return Math.round((fields.filter((f) => f !== null && f !== undefined).length / fields.length) * 100);
}

function buildUpcomingDeadlines(savedPrograms: SavedProgramItem[], nowTs: number): DeadlineItem[] {
  const deadlines: DeadlineItem[] = [];

  for (const item of savedPrograms) {
    if (!item.program.deadlines?.length) continue;

    for (const dl of item.program.deadlines) {
      // Parse deadline date safely
      const deadlineDate = new Date(dl.deadline);

      // Skip invalid dates
      if (isNaN(deadlineDate.getTime())) {
        console.warn(`Invalid deadline date for program ${item.program.id}:`, dl.deadline);
        continue;
      }

      const ts = deadlineDate.getTime();

      // Skip past deadlines
      if (ts < nowTs) continue;

      const daysLeft = Math.ceil((ts - nowTs) / (1000 * 60 * 60 * 24));

      deadlines.push({
        id: dl.id,
        title: `${item.program.title} — ${dl.term ?? "Application"}`,
        date: deadlineDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC" // Ensure consistent timezone
        }),
        type: "application",
        priority: daysLeft <= 30 ? "high" : daysLeft <= 90 ? "medium" : "low",
      });
    }
  }

  // Sort by timestamp (not string date) for accurate ordering
  deadlines.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  return deadlines;
}

// ─── SECTION: QUICK ACTIONS ──────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { href: "/app/programs", icon: BookOpen, label: "Program Match", desc: "Find programs that fit your profile" },
  { href: "/app/scholarships", icon: Award, label: "Scholarships", desc: "Discover funding you qualify for" },
  { href: "/app/sop", icon: FileText, label: "SOP Builder", desc: "AI-generated statement of purpose" },
  { href: "/app/cv", icon: Users, label: "CV Builder", desc: "ATS-ready academic & industry CVs" },
  { href: "/app/career", icon: TrendingUp, label: "Career Outlook", desc: "Employability score & pathways" },
  { href: "/app/jobs", icon: Briefcase, label: "Job Finder", desc: "Real-time jobs in your target country" },
] as const;

function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="text-lg font-semibold mb-4">Quick actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <RevealAnimation key={action.href} variant="scale" delay={i * 0.05}>
              <Link href={action.href} className="group block">
                <GlassCard glow className="p-4 h-full">
                  <div className="flex flex-col gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">{action.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </RevealAnimation>
          );
        })}
      </div>
    </section>
  );
}

// ─── SECTION: STATS ──────────────────────────────────────────────────────────

interface StatsProps {
  savedCount: number;
  matchCount: number;
  deadlineCount: number;
}

function StatsRow({ savedCount, matchCount, deadlineCount }: StatsProps) {
  const stats = [
    { icon: Bookmark, label: "Programs Saved", value: savedCount, color: "text-primary" },
    { icon: Sparkles, label: "Programs Matched", value: matchCount, color: "text-[#4A90D9]" },
    { icon: Calendar, label: "Upcoming Deadlines", value: deadlineCount, color: "text-[#C49A3C]" },
    { icon: Award, label: "Scholarships Available", value: 28, color: "text-[#3D9970]" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="list" aria-label="Dashboard statistics">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <RevealAnimation key={stat.label} variant="fadeUp" delay={i * 0.07} className="h-full">
            <GlassCard className="p-4 h-full" role="listitem">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                  <Icon className={`size-5 ${stat.color}`} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <AnimatedCounter
                    target={stat.value}
                    className={`text-2xl font-extrabold tabular-nums ${stat.color}`}
                    aria-label={`${stat.value} ${stat.label}`}
                  />
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          </RevealAnimation>
        );
      })}
    </div>
  );
}

// ─── SECTION: RECOMMENDED PROGRAMS ───────────────────────────────────────────

function RecommendedPrograms({ match }: { match: MatchLatestResponse | null }) {
  if (!match?.run || match.run.status !== "done" || !match.run.results?.length) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            Recommended Programs
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <GraduationCap className="size-10 text-muted-foreground/30 mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No recommendations yet</p>
          <p className="mt-1 text-xs text-muted-foreground mb-4">Run AI Match to get personalized program recommendations</p>
          <Link href="/app/match" className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
            Run Match
          </Link>
        </div>
      </GlassCard>
    );
  }

  const topPrograms = match.run.results.slice(0, 5);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          Recommended Programs
        </h2>
        <Link href="/app/match" className="flex items-center gap-1 text-sm text-primary hover:underline">
          View All <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <ul className="space-y-2" aria-label="Recommended programs list">
        {topPrograms.map((result, i) => {
          const raw = result.rawData ?? {};
          const title = (raw.program_title as string) ?? (raw.title as string) ?? "Unnamed Program";
          const university = (raw.university_name as string) ?? (raw.universityName as string) ?? "Unknown University";
          const country = (raw.country as string) ?? "";
          return (
            <li key={result.id}>
              <RevealAnimation variant="slideLeft" delay={i * 0.05}>
                <Link
                  href={result.programId ? `/app/programs/${result.programId}` : "/app/match"}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-primary/30 hover:bg-primary/[0.04] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{university}{country ? ` · ${country}` : ""}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <GradientText className="text-sm font-bold">{result.score}%</GradientText>
                    <ChevronRight className="size-4 text-muted-foreground/50" aria-hidden="true" />
                  </div>
                </Link>
              </RevealAnimation>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

// ─── SECTION: DEADLINES ──────────────────────────────────────────────────────

function UpcomingDeadlines({ deadlines }: { deadlines: DeadlineItem[] }) {
  if (!deadlines.length) {
    return (
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Calendar className="size-5 text-[#C49A3C]" aria-hidden="true" />
          Upcoming Deadlines
        </h2>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Clock className="size-8 text-muted-foreground/30 mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Save programs with deadlines to track them here</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="size-5 text-[#C49A3C]" aria-hidden="true" />
          Upcoming Deadlines
        </h2>
        <Link href="/app/timeline" className="text-sm text-primary hover:underline">View Timeline</Link>
      </div>
      <ul className="space-y-2" aria-label="Upcoming deadlines">
        {deadlines.slice(0, 5).map((dl) => (
          <li key={dl.id} className={`rounded-xl border px-3 py-2.5 ${dl.priority === "high" ? "border-[#C0392B]/30 bg-[#C0392B]/[0.04]" : dl.priority === "medium" ? "border-[#C49A3C]/30 bg-[#C49A3C]/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
            <p className="text-sm font-medium line-clamp-1">{dl.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="size-3 text-muted-foreground/50" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">{dl.date}</span>
              <StatusBadge variant={dl.priority === "high" ? "danger" : dl.priority === "medium" ? "warning" : "muted"}>
                {dl.priority}
              </StatusBadge>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

// ─── SECTION: SAVED + NEWS ───────────────────────────────────────────────────

function SavedShortlist({ savedPrograms }: { savedPrograms: SavedProgramItem[] }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bookmark className="size-5 text-primary" aria-hidden="true" />
          Saved Shortlist
        </h2>
        <Link href="/app/saved" className="text-sm text-primary hover:underline">View All</Link>
      </div>
      {savedPrograms.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <BookOpen className="size-8 text-muted-foreground/30 mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No saved programs</p>
          <Link href="/app/programs" className="mt-3 text-xs text-primary hover:underline">Browse Programs</Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {savedPrograms.slice(0, 3).map((item) => (
            <li key={item.id}>
              <Link
                href={`/app/programs/${item.program.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 hover:border-primary/30 hover:bg-primary/[0.04] transition-all"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.program.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3" aria-hidden="true" />
                    {item.program.university.name} · {item.program.university.country.name}
                  </p>
                </div>
                {item.program.tuitionMinUSD && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <DollarSign className="size-3" aria-hidden="true" />
                    ${item.program.tuitionMinUSD.toLocaleString()}/yr
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

function NewsSection({ news }: { news: FeedItem[] }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Globe className="size-5 text-primary" aria-hidden="true" />
        Education Pulse
      </h2>
      {news.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No news available</p>
      ) : (
        <ul className="space-y-2">
          {news.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:border-primary/30 hover:bg-primary/[0.04] transition-all"
              >
                <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary/70" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{item.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.sourceName}</span>
                    <span>·</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground/40" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

// ─── SECTION: HERO ────────────────────────────────────────────────────────────

interface HeroSectionProps {
  session: Session;
  profile: UserProfile;
  savedCount: number;
  deadlineCount: number;
}

function HeroSection({ session, profile, savedCount, deadlineCount }: HeroSectionProps) {
  const completeness = getProfileCompleteness(profile);
  const countries = getTargetCountriesDisplay(profile.targetCountries);
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0D1117] to-[#080C14] p-6 sm:p-8" aria-label="Welcome section">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="hidden md:block lg:hidden"
        style={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          width: 340,
          height: 180,
          opacity: 0.65,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <DashboardAnimation />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px] items-center">
        {/* Left: welcome */}
        <div className="relative z-10">
          <RevealAnimation variant="fadeIn">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-[#3D9970]" aria-hidden="true" />
              Welcome back
            </div>
          </RevealAnimation>
          <RevealAnimation variant="fadeUp" delay={0.05}>
            <div>
              <DynamicGreeting name={firstName} />
            </div>
          </RevealAnimation>
          <RevealAnimation variant="fadeUp" delay={0.1}>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg">
              {savedCount > 0
                ? `${savedCount} program${savedCount > 1 ? "s" : ""} saved${deadlineCount > 0 ? ` · ${deadlineCount} deadline${deadlineCount > 1 ? "s" : ""} coming up` : ""}`
                : "Start by exploring programs matched to your profile."}
              {countries ? ` · Targeting ${countries}` : ""}
            </p>
          </RevealAnimation>
          <RevealAnimation variant="fadeUp" delay={0.15}>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/app/programs"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                Explore Programs <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              {completeness < 80 && (
                <Link
                  href="/app/profile"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[rgba(74,144,217,0.18)] bg-white/[0.04] px-5 text-sm font-medium text-foreground hover:bg-white/[0.08] transition-colors"
                >
                  <Zap className="size-3.5 text-[#C49A3C]" aria-hidden="true" />
                  Profile {completeness}% complete
                </Link>
              )}
            </div>
          </RevealAnimation>
        </div>

        {/* Right: visual */}
        <div className="relative hidden lg:flex items-center justify-center h-[220px]">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

// ─── ROADMAP PREVIEW ──────────────────────────────────────────────────────────

interface RoadmapMonthSummary {
  month: string;
  label: string;
  items: Array<{ type: string; title: string }>;
}
interface UserRoadmapSummary {
  id: string; countryCode: string; intake?: string | null;
  startMonth: string; endMonth: string; plan: RoadmapMonthSummary[]; createdAt: string;
}

function RoadmapPreview({ timeline }: { timeline: unknown }) {
  const roadmap = timeline as UserRoadmapSummary | null;
  const plan = roadmap?.plan;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="size-5 text-primary" aria-hidden="true" />
          Your Timeline
        </h2>
        <Link
          href={plan?.length ? "/app/timeline?view=full" : "/app/timeline"}
          className="text-sm text-primary hover:underline"
        >
          {plan?.length ? "View Full" : "Generate"}
        </Link>
      </div>
      {!plan?.length ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Calendar className="size-8 text-muted-foreground/30 mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No timeline yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Generate a personalized application timeline</p>
          <Link href="/app/timeline" className="mt-3 text-xs text-primary hover:underline">Generate Timeline</Link>
        </div>
      ) : (
        <>
          {roadmap?.intake && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3" aria-hidden="true" />
              {roadmap.countryCode} · {roadmap.intake}
            </p>
          )}
          <ul className="space-y-2" aria-label="Timeline milestones">
            {plan.slice(0, 4).map((month, idx) => (
              <li key={month.month} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{month.label}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {month.items[0]?.title ?? "No tasks"}{month.items.length > 1 ? ` +${month.items.length - 1} more` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </GlassCard>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default async function StudyPlanPage() {
  // Session and profile are already validated by the layout, so we can safely fetch them here
  const [session, profile, match, savedPrograms, timeline, newsItems] = await Promise.allSettled([
    getSession(),
    getUserProfile(),
    getMatchLatest().catch((err) => { console.error("Match fetch failed:", err); return null; }),
    getSavedPrograms().catch((err) => { console.error("Saved programs fetch failed:", err); return []; }),
    getLatestTimeline().catch((err) => { console.error("Timeline fetch failed:", err); return null; }),
    fetchEducationPulse().catch((err) => { console.error("News fetch failed:", err); return []; }),
  ]);

  const sessionData = session.status === "fulfilled" ? session.value : null;
  const profileData = profile.status === "fulfilled" ? profile.value : null;
  const matchData = match.status === "fulfilled" ? match.value : null;
  const savedProgramsData = savedPrograms.status === "fulfilled" ? savedPrograms.value : [];
  const timelineData = timeline.status === "fulfilled" ? timeline.value : null;
  const newsData = newsItems.status === "fulfilled" ? newsItems.value.slice(0, 4) : [];

  // These checks are redundant since layout already validates, but kept for safety
  if (!sessionData) redirect("/auth/signin");
  if (!profileData || !profileData.onboardingDone) redirect("/onboarding");

  // eslint-disable-next-line react-hooks/purity
  const upcomingDeadlines = buildUpcomingDeadlines(savedProgramsData, Date.now());
  const matchCount = matchData?.run?.status === "done" ? (matchData.run.results?.length ?? 0) : 0;

  return (
    <main id="main-content" className="page-enter mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero */}
      <HeroSection
        session={sessionData}
        profile={profileData}
        savedCount={savedProgramsData.length}
        deadlineCount={upcomingDeadlines.length}
      />

      {/* Stats row */}
      <StatsRow
        savedCount={savedProgramsData.length}
        matchCount={matchCount}
        deadlineCount={upcomingDeadlines.length}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* 3-column feature grid */}
      <div className="grid gap-5 lg:grid-cols-12">
        <RevealAnimation variant="fadeUp" delay={0} className="lg:col-span-7">
          <RecommendedPrograms match={matchData} />
        </RevealAnimation>
        <RevealAnimation variant="fadeUp" delay={0.06} className="lg:col-span-5">
          <UpcomingDeadlines deadlines={upcomingDeadlines} />
        </RevealAnimation>
        <RevealAnimation variant="fadeUp" delay={0.1} className="lg:col-span-5">
          <RoadmapPreview timeline={timelineData} />
        </RevealAnimation>
        <RevealAnimation variant="fadeUp" delay={0.14} className="lg:col-span-7">
          <SavedShortlist savedPrograms={savedProgramsData} />
        </RevealAnimation>
        <RevealAnimation variant="fadeUp" delay={0.18} className="lg:col-span-12">
          <NewsSection news={newsData} />
        </RevealAnimation>
      </div>
    </main>
  );
}
