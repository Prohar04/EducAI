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
  ChevronRight,
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
} from "lucide-react";
import type { SavedProgramItem, MatchLatestResponse, UserProfile, Session } from "@/types/auth.type";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { AnimatedCard } from "@/components/motion/AnimatedCard";

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────

// Re-use FeedItem from the shared fetcher (imported above)

type DeadlineItem = {
  id: string;
  title: string;
  date: string;
  type: "application" | "scholarship" | "visa" | "test";
  priority: "high" | "medium" | "low";
};

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

const LEVEL_DISPLAY: Record<string, string> = {
  BSC: "Bachelor's",
  MSC: "Master's",
  PHD: "PhD",
  MBA: "MBA",
  DIPLOMA: "Diploma",
  BSc: "Bachelor's",
  MSc: "Master's",
  PhD: "PhD",
};

function formatCurrency(amount: number, currency: string = "USD"): string {
  return `${currency} ${amount.toLocaleString()}`;
}

function getTargetCountriesDisplay(targetCountries: unknown): string | null {
  try {
    if (Array.isArray(targetCountries)) return targetCountries.join(", ");
    if (typeof targetCountries === "string") return JSON.parse(targetCountries).join(", ");
  } catch {}
  return null;
}

function getProfileCompleteness(profile: UserProfile): number {
  const fields = [
    profile.currentStage,
    profile.targetIntake,
    profile.intendedLevel,
    profile.intendedMajor,
    profile.targetCountries,
    profile.gpa,
    profile.englishTestType,
    profile.budgetMax,
  ];
  const filled = fields.filter((f) => f !== null && f !== undefined).length;
  return Math.round((filled / fields.length) * 100);
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function SectionHeader({ title, icon: Icon, href, linkText }: { title: string; icon: React.ElementType; href?: string; linkText?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Icon className="size-5 text-primary" />
        {title}
      </h2>
      {href && linkText && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          {linkText}
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-[200px] truncate text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

function StatusBadge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" }) {
  const colors = {
    default: "bg-muted text-muted-foreground",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}

function EmptyState({ icon: Icon, title, description, ctaText, ctaHref }: {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
      <Icon className="mb-3 size-10 text-muted-foreground/50" />
      <p className="mb-1 text-sm font-medium text-foreground">{title}</p>
      <p className="mb-4 text-xs text-muted-foreground">{description}</p>
      <Link
        href={ctaHref}
        className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
      >
        {ctaText}
      </Link>
    </div>
  );
}

// ─── SECTION COMPONENTS ───────────────────────────────────────────────────────

function ProfileSnapshot({ profile, session }: { profile: UserProfile; session: Session }) {
  const targetCountries = getTargetCountriesDisplay(profile.targetCountries);
  const completeness = getProfileCompleteness(profile);
  const isComplete = completeness >= 80;

  return (
    <AnimatedCard className="h-full overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
      <div className="p-6">
      <SectionHeader title="Profile Snapshot" icon={GraduationCap} href="/app/profile" linkText="Edit" />

      <dl className="space-y-3">
        {session.user.name && <ProfileRow label="Name" value={session.user.name} />}
        {profile.currentStage && <ProfileRow label="Stage" value={profile.currentStage} />}
        {(profile.intendedLevel ?? profile.level) && (
          <ProfileRow
            label="Target Level"
            value={LEVEL_DISPLAY[profile.intendedLevel ?? profile.level ?? ""] ?? profile.intendedLevel ?? profile.level ?? ""}
          />
        )}
        {(profile.intendedMajor ?? profile.majorOrTrack) && (
          <ProfileRow label="Major" value={profile.intendedMajor ?? profile.majorOrTrack ?? ""} />
        )}
        {targetCountries && <ProfileRow label="Countries" value={targetCountries} />}
        {profile.targetIntake && <ProfileRow label="Intake" value={profile.targetIntake} />}
        {profile.gpa != null && (
          <ProfileRow label="GPA" value={`${profile.gpa}${profile.gpaScale ? ` / ${profile.gpaScale}` : ""}`} />
        )}
        {profile.englishTestType && profile.englishScore != null && (
          <ProfileRow label={profile.englishTestType} value={String(profile.englishScore)} />
        )}
        {profile.budgetMax != null && (
          <ProfileRow label="Budget/yr" value={formatCurrency(profile.budgetMax, profile.budgetCurrency ?? "USD")} />
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <StatusBadge variant={isComplete ? "success" : "warning"}>
          {isComplete ? "Profile Complete" : `${completeness}% Complete`}
        </StatusBadge>
        {session.user.emailVerified && <StatusBadge variant="success">Email Verified</StatusBadge>}
      </div>
      </div>
    </AnimatedCard>
  );
}

interface RoadmapMonthSummary {
  month: string;
  label: string;
  items: Array<{ type: string; title: string }>;
}

interface UserRoadmapSummary {
  id: string;
  countryCode: string;
  intake?: string | null;
  startMonth: string;
  endMonth: string;
  plan: RoadmapMonthSummary[];
  createdAt: string;
}

function YourRoadmap({ timeline }: { timeline: unknown }) {
  const roadmap = timeline as UserRoadmapSummary | null;
  const plan = roadmap?.plan;

  if (!plan || plan.length === 0) {
    return (
      <AnimatedCard className="h-full rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
        <SectionHeader title="Your Roadmap" icon={Target} />
        <EmptyState
          icon={Calendar}
          title="No roadmap yet"
          description="Generate a personalized timeline for your application journey"
          ctaText="Generate Roadmap"
          ctaHref="/app/timeline"
        />
      </AnimatedCard>
    );
  }

  const shownMonths = plan.slice(0, 4);

  return (
    <AnimatedCard className="h-full rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <SectionHeader title="Your Roadmap" icon={Target} href="/app/timeline" linkText="View Full Timeline" />

      {roadmap?.intake && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          {roadmap.countryCode} · {roadmap.intake}
        </p>
      )}

      <div className="space-y-2">
        {shownMonths.map((month, idx) => (
          <div key={month.month} className="flex gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{month.label}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {month.items[0]?.title ?? "No tasks"}
                {month.items.length > 1 && ` +${month.items.length - 1} more`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
}

function RecommendedPrograms({ match }: { match: MatchLatestResponse | null }) {
  if (!match?.run || match.run.status !== "done" || !match.run.results || match.run.results.length === 0) {
    return (
      <AnimatedCard className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
        <SectionHeader title="Recommended Programs" icon={Sparkles} />
        <EmptyState
          icon={GraduationCap}
          title="No recommendations yet"
          description="Run AI Match to get personalized program recommendations"
          ctaText="Run Match"
          ctaHref="/app/match"
        />
      </AnimatedCard>
    );
  }

  const topPrograms = match.run.results.slice(0, 5);

  return (
    <AnimatedCard className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <SectionHeader title="Recommended Programs" icon={Sparkles} href="/app/match" linkText="View All" />

      <StaggerChildren stagger={0.05} className="space-y-2">
        {topPrograms.map((result) => {
          // Extract program data from rawData (same pattern as match page)
          const raw = result.rawData ?? {};
          const title = (raw.program_title as string) ?? (raw.title as string) ?? "Unnamed Programme";
          const university = (raw.university_name as string) ?? (raw.universityName as string) ?? "Unknown University";
          const country = (raw.country as string) ?? "";

          return (
            <StaggerItem key={result.id}>
              <Link
                href={result.programId ? `/app/programs/${result.programId}` : "/app/match"}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {university}{country ? ` · ${country}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1.5">
                    <Award className="size-3.5 text-primary" />
                    <span className="text-sm font-semibold text-primary">{result.score}%</span>
                  </div>
                  <ChevronRight className="ml-auto mt-0.5 size-4 text-muted-foreground" />
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </AnimatedCard>
  );
}

function ImportantDeadlines({ deadlines }: { deadlines: DeadlineItem[] }) {
  const shown = deadlines.slice(0, 5);

  if (shown.length === 0) {
    return (
      <AnimatedCard className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
        <SectionHeader title="Upcoming Deadlines" icon={Calendar} />
        <EmptyState
          icon={Clock}
          title="No upcoming deadlines"
          description="Save programs with deadlines to track them here"
          ctaText="Browse Programs"
          ctaHref="/app/programs"
        />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <SectionHeader title="Upcoming Deadlines" icon={Calendar} href="/app/timeline" linkText="View Timeline" />

      <div className="space-y-2">
        {shown.map((deadline) => {
          const priorityColors = {
            high: "border-l-red-500",
            medium: "border-l-amber-500",
            low: "border-l-blue-500",
          };

          return (
            <div
              key={deadline.id}
              className={`rounded-lg border border-border border-l-4 bg-card p-3 transition-colors hover:bg-muted/30 ${priorityColors[deadline.priority]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{deadline.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {deadline.date}
                  </p>
                </div>
                <StatusBadge variant={deadline.priority === "high" ? "warning" : "default"}>
                  {deadline.priority}
                </StatusBadge>
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedCard>
  );
}

function SavedShortlist({ savedPrograms }: { savedPrograms: SavedProgramItem[] }) {
  if (savedPrograms.length === 0) {
    return (
      <AnimatedCard className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
        <SectionHeader title="Saved Shortlist" icon={Bookmark} />
        <EmptyState
          icon={BookOpen}
          title="No saved programs"
          description="Start building your shortlist by saving programs you're interested in"
          ctaText="Browse Programs"
          ctaHref="/app/programs"
        />
      </AnimatedCard>
    );
  }

  const topSaved = savedPrograms.slice(0, 3);

  return (
    <AnimatedCard className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <SectionHeader title="Saved Shortlist" icon={Bookmark} href="/app/saved" linkText="View All" />

      <div className="space-y-2">
        {topSaved.map((item) => {
          const tuition = item.program.tuitionMinUSD
            ? `$${item.program.tuitionMinUSD.toLocaleString()}/yr`
            : null;

          return (
            <Link
              key={item.id}
              href={`/app/programs/${item.program.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.program.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {item.program.university.name} · {item.program.university.country.name}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {tuition && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="size-3" />
                    {tuition}
                  </p>
                )}
                <ChevronRight className="ml-auto mt-0.5 size-4 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </AnimatedCard>
  );
}

function GlobalEducationPulse({ news }: { news: FeedItem[] }) {
  if (news.length === 0) {
    return (
      <AnimatedCard className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
        <SectionHeader title="Global Education Pulse" icon={Globe} />
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <Globe className="mx-auto mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No news available at the moment</p>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <SectionHeader title="Global Education Pulse" icon={Globe} />

      <div className="space-y-2">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug line-clamp-2">{item.title}</p>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{item.sourceName}</span>
                <span>·</span>
                <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <StatusBadge variant="default">{item.topic}</StatusBadge>
              </div>
            </div>
            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
    </AnimatedCard>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildUpcomingDeadlines(savedPrograms: SavedProgramItem[], nowTs: number): DeadlineItem[] {
  const deadlines: DeadlineItem[] = [];
  for (const item of savedPrograms) {
    if (!item.program.deadlines?.length) continue;
    for (const dl of item.program.deadlines) {
      const ts = new Date(dl.deadline).getTime();
      if (ts < nowTs) continue;
      const daysLeft = Math.ceil((ts - nowTs) / (1000 * 60 * 60 * 24));
      deadlines.push({
        id: dl.id,
        title: `${item.program.title} — ${dl.term ?? "Application"}`,
        date: new Date(dl.deadline).toLocaleDateString("en-US", {
          day: "numeric", month: "short", year: "numeric",
        }),
        type: "application",
        priority: daysLeft <= 30 ? "high" : daysLeft <= 90 ? "medium" : "low",
      });
    }
  }
  deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return deadlines;
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default async function StudyPlanPage() {
  // Fetch all data in parallel
  const [session, profile, match, savedPrograms, timeline, newsItems] = await Promise.allSettled([
    getSession(),
    getUserProfile(),
    getMatchLatest().catch(() => null),
    getSavedPrograms().catch(() => []),
    getLatestTimeline().catch(() => null),
    fetchEducationPulse().catch(() => []),
  ]);

  // Extract values
  const sessionData = session.status === "fulfilled" ? session.value : null;
  const profileData = profile.status === "fulfilled" ? profile.value : null;
  const matchData = match.status === "fulfilled" ? match.value : null;
  const savedProgramsData = savedPrograms.status === "fulfilled" ? savedPrograms.value : [];
  const timelineData = timeline.status === "fulfilled" ? timeline.value : null;
  const newsData = newsItems.status === "fulfilled" ? newsItems.value.slice(0, 5) : [];

  // Auth check
  if (!sessionData) redirect("/auth/signin");

  // Onboarding check - redirect to onboarding if not complete
  if (profileData && !profileData.onboardingDone) {
    redirect("/onboarding");
  }

  // Compute real deadlines from saved programs using server-side utility
  const upcomingDeadlines = buildUpcomingDeadlines(savedProgramsData, new Date().getTime());

  // No profile fallback
  if (!profileData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
              {sessionData?.user.name?.split(" ")[0] ?? "Study Plan"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Your application journey at a glance.</p>
          </div>

          <EmptyState
            icon={GraduationCap}
            title="Complete your profile to get started"
            description="Set up your profile to unlock personalized recommendations and insights"
            ctaText="Set Up Profile"
            ctaHref="/onboarding"
          />
        </FadeIn>
      </div>
    );
  }

  const completeness = getProfileCompleteness(profileData);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <FadeIn className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
              {sessionData.user.name?.split(" ")[0] ?? "Your Study Plan"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Your application journey at a glance.</p>
          </div>
          {completeness < 80 && (
            <Link
              href="/app/profile"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-primary/20 bg-primary/6 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <span className="hidden sm:inline">Profile</span> {completeness}% complete
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </FadeIn>

      {/* Grid Layout */}
      <StaggerChildren stagger={0.08} className="grid gap-6 lg:grid-cols-12">
        {/* Top Row */}
        <StaggerItem className="lg:col-span-5">
          <ProfileSnapshot profile={profileData} session={sessionData} />
        </StaggerItem>

        <StaggerItem className="lg:col-span-7">
          <YourRoadmap timeline={timelineData} />
        </StaggerItem>

        {/* Middle Row */}
        <StaggerItem className="lg:col-span-7">
          <RecommendedPrograms match={matchData} />
        </StaggerItem>

        <StaggerItem className="lg:col-span-5">
          <ImportantDeadlines deadlines={upcomingDeadlines} />
        </StaggerItem>

        {/* Bottom Row */}
        <StaggerItem className="lg:col-span-6">
          <SavedShortlist savedPrograms={savedProgramsData} />
        </StaggerItem>

        <StaggerItem className="lg:col-span-6">
          <GlobalEducationPulse news={newsData} />
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}
