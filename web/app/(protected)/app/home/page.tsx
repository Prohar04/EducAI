import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserProfile, getSavedPrograms } from "@/lib/auth/action";
import { COUNTRIES, COUNTRY_TESTS } from "@/lib/data/countries";
import { STAGES } from "@/lib/data/stages";
import HomeAnimations, { type SerializedSuggestion } from "./_components/HomeAnimations";

// ─── helpers ─────────────────────────────────────────────────────────────────

function resolveCountries(codes: string[]) {
  return codes.map((code) => ({
    code,
    name: COUNTRIES.find((c) => c.code === code)?.name ?? code,
    flag: COUNTRIES.find((c) => c.code === code)?.flag ?? "🌍",
  }));
}

function buildSuggestions(
  profile: Awaited<ReturnType<typeof getUserProfile>>,
  savedCount: number,
): SerializedSuggestion[] {
  if (!profile) return [];
  const out: SerializedSuggestion[] = [];

  // English test missing & targeting English-speaking countries
  const engCountries = (profile.targetCountries as string[] | null ?? []).filter(
    (c) => COUNTRY_TESTS[c]?.includes("IELTS") || COUNTRY_TESTS[c]?.includes("TOEFL"),
  );
  if (!profile.englishTestType && engCountries.length > 0) {
    const names = resolveCountries(engCountries).map((c) => c.name).join(", ");
    out.push({
      iconType: "target",
      title: "Plan your English test",
      body: `Your target countries (${names}) require IELTS or TOEFL.`,
      tag: "Action needed",
      tagVariant: "warn",
      href: "/app/onboarding?edit=true",
      hrefLabel: "Add test score →",
    });
  }

  // No saved programmes
  if (savedCount === 0) {
    out.push({
      iconType: "bookmark",
      title: "Shortlist your programmes",
      body: "Browse the programme catalogue and save at least 10 courses to compare.",
      tag: "Recommended",
      tagVariant: "info",
      href: "/app/programs",
      hrefLabel: "Browse programmes →",
    });
  }

  // GPA / major missing
  if (!profile.gpa && !profile.majorOrTrack) {
    out.push({
      iconType: "trending",
      title: "Complete your academic profile",
      body: "Adding your GPA and major unlocks more accurate programme matching.",
      tag: "Improve matches",
      tagVariant: "info",
      href: "/app/onboarding?edit=true",
      hrefLabel: "Edit profile →",
    });
  }

  // Intake timeline reminder
  if (profile.targetIntake) {
    out.push({
      iconType: "calendar",
      title: `Prepare for ${profile.targetIntake}`,
      body: "Application timelines typically open 9–12 months before intake. Stay ahead.",
      tag: "Timeline",
      tagVariant: "success",
    });
  }

  return out.slice(0, 4);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [session, profile, savedResult] = await Promise.allSettled([
    getSession(),
    getUserProfile(),
    getSavedPrograms(),
  ]);

  const sess = session.status === "fulfilled" ? session.value : null;
  if (!sess) redirect("/auth/signin");

  const prof = profile.status === "fulfilled" ? profile.value : null;
  if (!prof?.onboardingDone) redirect("/onboarding");

  const saved = savedResult.status === "fulfilled" ? savedResult.value : [];

  const firstName = sess.user.name?.split(" ")[0] ?? "there";
  const targetCountries = resolveCountries((prof?.targetCountries as string[] | null) ?? []);
  const stage = STAGES.find((s) => s.value === prof?.currentStage);
  const suggestions = buildSuggestions(prof, saved.length);
  const profileComplete = !!prof?.majorOrTrack && !!prof?.gpa && !!prof?.englishTestType;

  return (
    <HomeAnimations
      firstName={firstName}
      prof={prof}
      targetCountries={targetCountries}
      stage={stage}
      suggestions={suggestions}
      savedCount={saved.length}
      profileComplete={profileComplete}
    />
  );
}
