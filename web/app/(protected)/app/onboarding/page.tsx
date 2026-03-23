import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/auth/action";
import OnboardingWizard from "./_components/OnboardingWizard";

export const metadata = { title: "Welcome · EducAI" };

export default async function OnboardingPage() {
	const session = await getSession();
	if (!session) redirect("/auth/signin");

	const profile = await getUserProfile();

	// If onboarding is already done, redirect to app
	if (profile?.onboardingDone) {
		redirect("/app");
	}

	return (
		<div className="min-h-[calc(100vh-4rem)] bg-background">
			<OnboardingWizard initialProfile={profile} />
		</div>
	);
}
