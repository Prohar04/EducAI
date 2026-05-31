"use client";

import Link from "next/link";
import useSWR from "swr";
import SaveButton from "../../programs/_components/SaveButton";
import { SavedIllustration } from "@/components/illustrations";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { Loader2, AlertCircle } from "lucide-react";
import type { SavedProgramItem } from "@/types/auth.type";

const LEVEL_LABELS: Record<string, string> = {
  BSC: "Bachelor's",
  MSC: "Master's",
  PHD: "PhD",
  MBA: "MBA",
  DIPLOMA: "Diploma",
};

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.savedPrograms || [];
};

export default function SavedProgramsClient() {
  const { data: saved, error, isLoading } = useSWR<SavedProgramItem[]>(
    "/api/saved-programs",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <FadeIn className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Saved Programs
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your bookmarked programs.
        </p>
      </FadeIn>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading saved programs...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h2 className="text-lg font-semibold">Failed to load saved programs</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {error.message || "Please try refreshing the page"}
          </p>
        </div>
      ) : !saved || saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
          <SavedIllustration className="mb-3 h-28 w-auto text-primary opacity-75 sm:h-32" />
          <h2 className="text-lg font-semibold">Nothing saved yet</h2>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Browse programs and click &quot;Save&quot; to bookmark them here.
          </p>
          <Link
            href="/app/programs"
            className="mt-5 inline-flex h-10 w-full max-w-xs items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:h-9 sm:w-auto"
          >
            Browse Programs
          </Link>
        </div>
      ) : (
        <StaggerChildren stagger={0.07} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((item) => {
            const { program } = item;
            const tuition =
              program.tuitionMinUSD != null
                ? program.tuitionMaxUSD != null
                  ? `$${program.tuitionMinUSD.toLocaleString()} – $${program.tuitionMaxUSD.toLocaleString()}/yr`
                  : `From $${program.tuitionMinUSD.toLocaleString()}/yr`
                : "Tuition N/A";

            return (
              <StaggerItem key={item.id}>
                <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md h-full">
                  {/* Accent band */}
                  <div className="h-1 w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
                  <div className="flex flex-col flex-1 p-5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {LEVEL_LABELS[program.level] ?? program.level}
                        </span>
                        <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {program.field}
                        </span>
                      </div>
                      <SaveButton programId={program.id} initialSaved={true} />
                    </div>
                    <Link href={`/app/programs/${program.id}`} className="flex-1">
                      <h2 className="break-words font-semibold leading-snug transition-colors group-hover:text-primary">
                        {program.title}
                      </h2>
                      <p className="mt-0.5 break-words text-sm text-muted-foreground">
                        {program.university.name}
                      </p>
                      <p className="break-words text-xs text-muted-foreground">
                        {program.university.country.name}
                        {program.university.city ? `, ${program.university.city}` : ""}
                      </p>
                    </Link>
                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      <span className="font-medium">{tuition}</span>
                      <span className="font-medium text-primary/70 transition-colors group-hover:text-primary">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}
    </div>
  );
}
