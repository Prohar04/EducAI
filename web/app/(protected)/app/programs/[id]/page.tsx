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
  Languages,
  Building2,
  RefreshCw,
  Globe,
  Award,
  Users,
  CreditCard,
  Monitor,
} from "lucide-react";
import { getProgramById, getSavedPrograms } from "@/lib/auth/action";
import SaveButton from "../_components/SaveButton";
import { FadeIn } from "@/components/motion/FadeIn";
import type { FreshnessStatus } from "@/types/auth.type";

const LEVEL_LABELS: Record<string, string> = {
  BSC: "Bachelor's",
  MSC: "Master's",
  PHD: "PhD",
  MBA: "MBA",
  DIPLOMA: "Diploma",
};

const LANGUAGE_KEYS = ["ielts", "toefl", "duolingo", "english", "language", "pte", "cambridge"];
const GRE_KEYS = ["gre", "gmat", "sat", "act"];

function isLanguageReq(key: string) {
  return LANGUAGE_KEYS.some((k) => key.toLowerCase().includes(k));
}

function isTestReq(key: string) {
  return GRE_KEYS.some((k) => key.toLowerCase().includes(k));
}

function formatRelativeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
}

const FRESHNESS_CONFIG: Record<
  FreshnessStatus,
  { label: string; desc: string; className: string }
> = {
  live:               { label: "Live",     desc: "Verified within the last 24 hours",   className: "border-green-500/30 bg-green-500/8 text-green-700 dark:text-green-400" },
  recent:             { label: "Recent",   desc: "Verified within the last 7 days",      className: "border-blue-500/30 bg-blue-500/8 text-blue-700 dark:text-blue-400" },
  cached:             { label: "Cached",   desc: "Verified within the last 30 days",     className: "border-amber-500/30 bg-amber-500/8 text-amber-700 dark:text-amber-400" },
  stale:              { label: "Stale",    desc: "Last verified more than 30 days ago",  className: "border-red-500/30 bg-red-500/8 text-red-700 dark:text-red-400" },
  source_unavailable: { label: "Offline",  desc: "Source currently unavailable",         className: "border-border bg-muted/30 text-muted-foreground" },
};

function ExternalLinkItem({
  href,
  label,
  variant = "default",
}: {
  href: string;
  label: string;
  variant?: "primary" | "default";
}) {
  if (variant === "primary") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-between gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
      >
        {label}
        <ExternalLink className="size-4 shrink-0" />
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-muted/40"
    >
      {label}
      <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

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
  // eslint-disable-next-line react-hooks/purity -- server component: Date.now() runs once at request time
  const now = Date.now();

  const allRequirements = program.requirements ?? [];
  const languageReqs = allRequirements.filter((r) => isLanguageReq(r.key));
  const testReqs = allRequirements.filter((r) => isTestReq(r.key));
  const otherReqs = allRequirements.filter(
    (r) => !isLanguageReq(r.key) && !isTestReq(r.key)
  );

  const freshnessLabel = formatRelativeDate(program.lastVerifiedAt ?? program.updatedAt ?? program.createdAt);
  const freshnessStatus = program.freshnessStatus ?? "source_unavailable";
  const freshnessCfg = FRESHNESS_CONFIG[freshnessStatus];
  const uni = program.university;

  // Collect all university links
  const uniLinks: { href: string; label: string }[] = [
    uni.website             ? { href: uni.website,             label: "University Website" }        : null,
    uni.admissionsUrl       ? { href: uni.admissionsUrl,       label: "Admissions Office" }         : null,
    uni.applicationPortalUrl ? { href: uni.applicationPortalUrl, label: "Application Portal" }      : null,
    uni.tuitionUrl          ? { href: uni.tuitionUrl,          label: "Tuition & Fees" }            : null,
    uni.scholarshipsUrl     ? { href: uni.scholarshipsUrl,     label: "Scholarships & Funding" }    : null,
    uni.internationalUrl    ? { href: uni.internationalUrl,    label: "International Students" }    : null,
  ].filter((x): x is { href: string; label: string } => x !== null);

  const programLinks: { href: string; label: string; primary?: boolean }[] = [
    program.sourceUrl           ? { href: program.sourceUrl,           label: "Official Programme Page", primary: true } : null,
    program.applicationPortalUrl ? { href: program.applicationPortalUrl, label: "Application Portal" }                   : null,
  ].filter((x): x is { href: string; label: string; primary?: boolean } => x !== null);

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
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${freshnessCfg.className}`}>
                    {freshnessCfg.label}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight leading-snug sm:text-3xl">
                  {program.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="size-4 text-primary/70" />
                    {uni.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary/70" />
                    {uni.city ? `${uni.city}, ` : ""}{uni.country.name}
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
                value={uni.country.name}
              />
            </div>

            {/* Secondary details row */}
            {(program.studyMode || program.languageOfInstruction || program.applicationFeeUSD != null) && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {program.studyMode && (
                  <QuickStat icon={Monitor} label="Study Mode" value={program.studyMode} />
                )}
                {program.languageOfInstruction && (
                  <QuickStat icon={Languages} label="Language" value={program.languageOfInstruction} />
                )}
                {program.applicationFeeUSD != null && (
                  <QuickStat
                    icon={CreditCard}
                    label="Application Fee"
                    value={`$${program.applicationFeeUSD.toLocaleString()}`}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Programme description */}
          {program.description && (
            <FadeIn delay={0.08}>
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-3 flex items-center gap-2 font-bold">
                  <BookOpen className="size-4 text-primary" />
                  About this programme
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
              </section>
            </FadeIn>
          )}

          {/* Entry Requirements */}
          {allRequirements.length > 0 && (
            <FadeIn delay={0.12}>
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="size-4 text-primary" />
                  Entry Requirements
                </h2>

                {otherReqs.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Academic</p>
                    <div className="space-y-2">
                      {otherReqs.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm"
                        >
                          <span className="font-medium text-foreground">{req.key}</span>
                          <span className="ml-4 text-right text-muted-foreground">{req.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {languageReqs.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Languages className="size-3" /> Language
                    </p>
                    <div className="space-y-2">
                      {languageReqs.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm"
                        >
                          <span className="font-medium text-foreground">{req.key}</span>
                          <span className="ml-4 text-right text-blue-600 dark:text-blue-400 font-semibold">{req.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {testReqs.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Test Scores</p>
                    <div className="space-y-2">
                      {testReqs.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm"
                        >
                          <span className="font-medium text-foreground">{req.key}</span>
                          <span className="ml-4 text-right text-amber-600 dark:text-amber-400 font-semibold">{req.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-start gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-primary/60" />
                  Verify requirements directly with the university before applying. Data is scraped and may not reflect the latest changes.
                </div>
              </section>
            </FadeIn>
          )}

          {/* University information */}
          <FadeIn delay={0.14}>
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <Building2 className="size-4 text-primary" />
                University Information
              </h2>

              <div className="space-y-3">
                <InfoRow label="Name"    value={uni.name} />
                <InfoRow label="Country" value={uni.country.name} />
                {uni.city          && <InfoRow label="City"    value={uni.city} />}
                {uni.ranking       && <InfoRow label="Ranking" value={uni.ranking} icon={<Award className="size-3.5 text-amber-500" />} />}
                {uni.universityType && <InfoRow label="Type"   value={uni.universityType.charAt(0).toUpperCase() + uni.universityType.slice(1)} />}
                {uni.description && (
                  <div className="pt-1">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">About</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{uni.description}</p>
                  </div>
                )}
              </div>

              {uniLinks.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Globe className="size-3" /> University Links
                  </p>
                  {uniLinks.map((link) => (
                    <ExternalLinkItem key={link.href} href={link.href} label={link.label} />
                  ))}
                </div>
              )}
            </section>
          </FadeIn>
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

          {/* Programme links */}
          {programLinks.length > 0 && (
            <FadeIn delay={0.16}>
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="mb-4 font-bold">Programme Links</h2>
                <div className="space-y-2.5">
                  {programLinks.map((link) => (
                    <ExternalLinkItem
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      variant={link.primary ? "primary" : "default"}
                    />
                  ))}
                </div>
                {program.sourceUrl && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Source:{" "}
                    <a href={program.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
                      {(() => { try { return new URL(program.sourceUrl).hostname; } catch { return program.sourceUrl; } })()}
                    </a>
                  </p>
                )}
              </section>
            </FadeIn>
          )}

          {/* Data freshness */}
          <FadeIn delay={0.18}>
            <div className={`rounded-xl border px-4 py-4 ${freshnessCfg.className}`}>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="size-3.5 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wide">{freshnessCfg.label} data</span>
              </div>
              <p className="text-xs">{freshnessCfg.desc}.</p>
              {freshnessLabel && (
                <p className="mt-1.5 text-xs">
                  Last verified: <span className="font-semibold">{freshnessLabel}</span>
                </p>
              )}
              <p className="mt-2 text-xs opacity-80">
                Always confirm details on the official programme page before applying.
              </p>
            </div>
          </FadeIn>

          {/* University international students page */}
          {uni.internationalUrl && (
            <FadeIn delay={0.2}>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="size-4 text-primary" />
                  <p className="font-semibold text-sm">International Students</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Find visa requirements, support services, and arrival guides on the university's international students page.
                </p>
                <ExternalLinkItem href={uni.internationalUrl} label="View International Info" />
              </div>
            </FadeIn>
          )}

          {/* Save CTA */}
          <FadeIn delay={0.22}>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
              <GraduationCap className="mx-auto mb-2 size-8 text-primary" />
              <p className="mb-3 text-sm font-semibold">Save this programme</p>
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

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="font-medium text-muted-foreground shrink-0">{label}</span>
      <span className="text-right text-foreground flex items-center gap-1">
        {icon}
        {value}
      </span>
    </div>
  );
}
