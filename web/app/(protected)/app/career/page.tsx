"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle, Briefcase, DollarSign, Globe, Loader2,
  Sparkles, TrendingUp, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { RevealAnimation } from "@/components/ui/reveal-animation";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmployabilityGauge } from "@/components/features/career/employability-gauge";
import { predictCareerAction, type CareerResult } from "@/lib/auth/action";

const OUTLOOK_STYLES = {
  Excellent: { badge: "success" as const, bar: "bg-emerald-500" },
  Good: { badge: "info" as const, bar: "bg-blue-500" },
  Moderate: { badge: "warning" as const, bar: "bg-amber-500" },
  Challenging: { badge: "danger" as const, bar: "bg-rose-500" },
};

const RATING_BADGE: Record<string, "success" | "info" | "warning" | "danger"> = {
  Strong: "success",
  Good: "info",
  Moderate: "warning",
  Weak: "danger",
};

const DEMAND_BADGE: Record<string, "success" | "warning" | "danger"> = {
  High: "success",
  Medium: "warning",
  Low: "danger",
};

export default function CareerPage() {
  const [result, setResult] = useState<CareerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePredict() {
    setError(null);
    startTransition(async () => {
      const res = await predictCareerAction();
      if (!res) {
        setError("Prediction failed. Please complete your profile and try again.");
        return;
      }
      setResult(res);
    });
  }

  const outlookStyle = result ? (OUTLOOK_STYLES[result.overallOutlook] ?? OUTLOOK_STYLES.Moderate) : null;

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Career Outlook"
        gradientWord="Outlook"
        subtitle="Job market demand, employability factors, salary ranges, and career pathways for your field and target country"
        action={
          result && (
            <Button variant="outline" size="sm" onClick={handlePredict} disabled={isPending} className="gap-1.5">
              {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Sparkles className="size-3.5" aria-hidden="true" />}
              Re-analyze
            </Button>
          )
        }
      />

      {!result ? (
        <RevealAnimation variant="fadeUp">
          <GlassCard className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12">
              <TrendingUp className="size-8 text-primary" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Predict Your Career Outcomes</h2>
            <p className="max-w-sm text-sm text-muted-foreground mb-6">
              Get a data-grounded assessment of job market demand, salary ranges, career pathways,
              and employability factors based on your field and target country.
            </p>
            <Button onClick={handlePredict} disabled={isPending} size="lg" className="gap-2">
              {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Sparkles className="size-4" aria-hidden="true" />}
              {isPending ? "Analyzing career outlook…" : "Predict My Career Outcomes"}
            </Button>
            {error && (
              <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-2.5 text-sm text-rose-400">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Based on your profile — complete your profile for more accurate predictions</p>
          </GlassCard>
        </RevealAnimation>
      ) : (
        <div className="space-y-6">
          {/* Overview: gauge + summary */}
          <RevealAnimation variant="fadeUp">
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                <EmployabilityGauge score={result.employabilityScore} size={160} strokeWidth={12} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Globe className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">{result.topCountry}</span>
                    {outlookStyle && (
                      <StatusBadge variant={outlookStyle.badge} dot>
                        {result.overallOutlook} Outlook
                      </StatusBadge>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Employability Overview</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.outlookSummary}</p>
                </div>
              </div>
            </GlassCard>
          </RevealAnimation>

          {/* Employability Factors */}
          {result.factors.length > 0 && (
            <RevealAnimation variant="fadeUp" delay={0.06}>
              <section aria-labelledby="factors-heading">
                <h3 id="factors-heading" className="mb-3 text-sm font-semibold">Employability Factors</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {result.factors.map((f, i) => (
                    <RevealAnimation key={i} variant="scale" delay={i * 0.04}>
                      <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold">{f.factor}</p>
                          <StatusBadge variant={RATING_BADGE[f.rating] ?? "muted"}>
                            {f.rating}
                          </StatusBadge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{f.explanation}</p>
                      </GlassCard>
                    </RevealAnimation>
                  ))}
                </div>
              </section>
            </RevealAnimation>
          )}

          {/* Career Pathways */}
          {result.pathways.length > 0 && (
            <RevealAnimation variant="fadeUp" delay={0.1}>
              <section aria-labelledby="pathways-heading">
                <h3 id="pathways-heading" className="mb-3 text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="size-4 text-primary" aria-hidden="true" />
                  Career Pathways
                </h3>
                <div className="space-y-3">
                  {result.pathways.map((p, i) => (
                    <GlassCard key={i} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{p.role}</p>
                          <p className="text-xs text-muted-foreground">{p.sector}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <DollarSign className="size-3.5" aria-hidden="true" />
                            {p.salaryRangeUsd}
                          </span>
                          <StatusBadge variant={DEMAND_BADGE[p.demandLevel] ?? "muted"}>
                            {p.demandLevel} demand
                          </StatusBadge>
                          <span className="text-xs text-muted-foreground">{p.timeToEntry}</span>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            </RevealAnimation>
          )}

          {/* Skills + Trends row */}
          <div className="grid gap-5 sm:grid-cols-2">
            {result.keySkillsToAdd.length > 0 && (
              <RevealAnimation variant="slideLeft" delay={0.12}>
                <GlassCard className="p-5 h-full">
                  <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                    <Zap className="size-4 text-primary" aria-hidden="true" />
                    Key Skills to Add
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keySkillsToAdd.map((skill, i) => (
                      <span key={i} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-foreground/80">
                        {skill}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </RevealAnimation>
            )}
            {result.industryTrends.length > 0 && (
              <RevealAnimation variant="slideRight" delay={0.12}>
                <GlassCard className="p-5 h-full">
                  <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                    Industry Trends
                  </h3>
                  <ul className="space-y-2" aria-label="Industry trends">
                    {result.industryTrends.map((trend, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1.5 size-1.5 rounded-full bg-primary/60 shrink-0" aria-hidden="true" />
                        {trend}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </RevealAnimation>
            )}
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3" role="note">
            <p className="text-xs text-amber-400/90">{result.disclaimer}</p>
          </div>
        </div>
      )}
    </main>
  );
}
