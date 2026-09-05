import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/auth/action";
import { fetchEducationPulse } from "@/lib/data/fetchEducationPulse";
import DashboardClient from "./_components/DashboardClient";

export const dynamic = "force-dynamic";


/** Active scholarships, from the same endpoint the marketing site reads. */
async function getPublicScholarshipCount(): Promise<number | null> {
  const base = process.env.BACKEND_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base.replace(/\/+$/, "")}/public/stats`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { scholarships?: number };
    return typeof data.scholarships === "number" ? data.scholarships : null;
  } catch {
    return null;
  }
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default async function StudyPlanPage() {
  // Session and profile are already validated by the layout
  const session = await getSession();
  const profile = await getUserProfile();

  // These checks are redundant since layout already validates, but kept for safety
  if (!session) redirect("/auth/signin");
  if (!profile || !profile.onboardingDone) redirect("/onboarding");

  // Fetch news server-side (static data that doesn't need SWR)
  const news = await fetchEducationPulse().catch(() => []);

  // The scholarship tile used to be a hardcoded 28 while the rest of the app
  // showed the real figure, so the dashboard contradicted the page one click
  // away. Null hides the tile rather than showing a number we cannot stand by.
  const scholarshipCount = await getPublicScholarshipCount();

  return (
    <DashboardClient
      initialSession={session}
      initialProfile={profile}
      initialNews={news.slice(0, 4)}
      scholarshipCount={scholarshipCount}
    />
  );
}
