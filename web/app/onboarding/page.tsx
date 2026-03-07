import { getSession } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/auth/action";
import { redirect } from "next/navigation";
import OnboardingWizard from "./_components/OnboardingWizard";
import type { UserProfile } from "@/types/auth.type";

export const metadata = {
	title: "Set Up Your Profile | EducAI",
	description: "Tell us about your study goals to personalise your EducAI experience.",
};

export default async function OnboardingPage() {
	const session = await getSession();
	if (!session) redirect("/auth/signin");

	// If already completed, skip to workspace
	const profile = await getUserProfile();
	if (profile?.onboardingDone) redirect("/app");

	return (
		<OnboardingWizard
			user={session.user}
			initialProfile={profile as UserProfile | null}
		/>
	);
}
