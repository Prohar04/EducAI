import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  ArrowLeft,
  MapPin,
  Clock,
  GraduationCap,
  BookOpen,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Info,
} from "lucide-react";
import { getProgramById, getSavedPrograms } from "@/lib/auth/action";
import SaveButton from "../_components/SaveButton";
import { FadeIn } from "@/components/motion/FadeIn";

const LEVEL_LABELS: Record<string, string> = {
  BSC: "Bachelor's",
  MSC: "Master's",
  PHD: "PhD",
  MBA: "MBA",
  DIPLOMA: "Diploma",
};

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [program, saved] = await Promise.all([
    getProgramById(id),
    getSavedPrograms(),
  ]);

  if (!program) notFound();

  const isSaved = saved.some((s) => s.programId === id);

  const tuitionRange =
    program.tuitionMinUSD != null
      ? program.tuitionMaxUSD != null
        ? `$${program.tuitionMinUSD.toLocaleString()} – $${program.tuitionMaxUSD.toLocaleString()}/yr`
        : `From $${program.tuitionMinUSD.toLocaleString()}/yr`
      : null;

  const levelLabel = LEVEL_LABELS[program.level] ?? program.level;
  // eslint-disable-next-line react-hooks/purity -- server component: Date.now() runs once at request time, not on re-render
  const now = Date.now();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <FadeIn>
        <Link
          href="/app/programs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Programs
        </Link>
      </FadeIn>

      {/* Header card */}
      <FadeIn delay={0.04}>
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
          {/* Accent band */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                    {levelLabel}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {program.field}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight leading-snug sm:text-3xl">
                  {program.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="size-4 text-primary/70" />
                    {program.university.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary/70" />
                    {program.university.city ? `${program.university.city}, ` : ""}{program.university.country.name}
                  </span>
                  {program.durationMonths != null && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4 text-primary/70" />
                      {program.durationMonths} month{program.durationMonths !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <SaveButton programId={program.id} initialSaved={isSaved} />
              </div>
            </div>

            {/* Quick stats row */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <QuickStat
                icon={DollarSign}
                label="Tuition"
                value={tuitionRange ?? "Not listed"}
                highlight={!!tuitionRange}
              />
              <QuickStat
                icon={BookOpen}
                label="Field"
                value={program.field}
              />
              <QuickStat
                icon={GraduationCap}
                label="Level"
                value={levelLabel}
              />
              <QuickStat
                icon={MapPin}
                label="Country"
                value={program.university.country.name}
              />
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          {program.description && (
            <FadeIn delay={0.08}>
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-3 flex items-center gap-2 font-bold">
                  <BookOpen className="size-4 text-primary" />
                  About this program
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
              </section>
            </FadeIn>
          )}

          {/* Requirements */}
          {program.requirements && program.requirements.length > 0 && (
            <FadeIn delay={0.12}>
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="size-4 text-primary" />
                  Entry Requirements
                </h2>
                <div className="space-y-2">
                  {program.requirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-foreground">{req.key}</span>
                      <span className="ml-4 text-right text-muted-foreground">{req.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-primary/60" />
                  Verify requirements directly with the university before applying. Data is scraped and may not reflect the latest changes.
                </div>
              </section>
            </FadeIn>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deadlines */}
          {program.deadlines && program.deadlines.length > 0 && (
            <FadeIn delay={0.1}>
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 font-bold">
                  <CalendarDays className="size-4 text-primary" />
                  Application Deadlines
                </h2>
                <div className="space-y-2.5">
                  {program.deadlines.map((dl) => {
                    const date = new Date(dl.deadline);
                    const daysLeft = Math.ceil((date.getTime() - now) / (1000 * 60 * 60 * 24));
                    const urgency =
                      daysLeft < 0
                        ? "text-muted-foreground line-through"
                        : daysLeft <= 30
                        ? "text-red-500"
                        : daysLeft <= 90
                        ? "text-amber-500"
                        : "text-green-500";
                    return (
                      <div key={dl.id} className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                        <p className="text-xs font-semibold text-muted-foreground">{dl.term ?? "Application"}</p>
                        <p className="mt-1 font-medium text-sm">
                          {date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        {daysLeft >= 0 && (
                          <p className={`mt-0.5 text-xs font-semibold ${urgency}`}>
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                          </p>
                        )}
                        {daysLeft < 0 && (
                          <p className="mt-0.5 text-xs text-muted-foreground">Passed</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </FadeIn>
          )}

          {/* Links */}
          {(program.sourceUrl || program.university.website) && (
            <FadeIn delay={0.14}>
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 font-bold">Official Links</h2>
                <div className="space-y-2.5">
                  {program.sourceUrl && (
                    <a
                      href={program.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-between gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                    >
                      Official Program Page
                      <ExternalLink className="size-4 shrink-0" />
                    </a>
                  )}
                  {program.university.website && (
                    <a
                      href={program.university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-muted/40"
                    >
                      University Website
                      <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                    </a>
                  )}
                </div>
                {program.sourceUrl && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Source:{" "}
                    <a href={program.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
                      {new URL(program.sourceUrl).hostname}
                    </a>
                  </p>
                )}
              </section>
            </FadeIn>
          )}

          {/* Save CTA */}
          <FadeIn delay={0.16}>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
              <GraduationCap className="mx-auto mb-2 size-8 text-primary" />
              <p className="mb-3 text-sm font-semibold">Save this program</p>
              <p className="mb-4 text-xs text-muted-foreground">
                Saving adds it to your timeline, strategy analysis, and deadline tracker.
              </p>
              <SaveButton programId={program.id} initialSaved={isSaved} />
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${highlight ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30"}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`size-3.5 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm font-semibold leading-snug ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
