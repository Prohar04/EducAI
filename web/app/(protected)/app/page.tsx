import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/auth/action";
import Link from "next/link";
import { GraduationCap, BookOpen, Sparkles, Bookmark } from "lucide-react";

export default async function AppDashboard() {
  const profile = await getUserProfile();

  if (!profile || !profile.onboardingDone) {
    redirect("/app/onboarding");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here&apos;s your personalised overview.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          href="/app/programs"
          icon={<BookOpen className="size-5" />}
          title="Programs"
          description="Browse university programmes matched to your profile."
        />
        <DashboardCard
          href="/app/match"
          icon={<Sparkles className="size-5" />}
          title="Match"
          description="Score and rank programmes based on your preferences."
        />
        <DashboardCard
          href="/app/saved"
          icon={<Bookmark className="size-5" />}
          title="Saved"
          description="Your bookmarked programmes, ready to review."
        />
      </div>

      {profile.targetCountry && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="size-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Your target</p>
              <p className="font-semibold">
                {profile.level ?? "Unknown level"} in {profile.intendedMajor ?? "your field"} — {profile.targetCountry}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
    >
      <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="font-semibold group-hover:text-primary">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
