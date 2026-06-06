import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/auth/action";
import { fetchEducationPulse } from "@/lib/data/fetchEducationPulse";
import DashboardClient from "./_components/DashboardClient";

export const dynamic = "force-dynamic";


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

  return (
    <DashboardClient
      initialSession={session}
      initialProfile={profile}
      initialNews={news.slice(0, 4)}
    />
  );
}
