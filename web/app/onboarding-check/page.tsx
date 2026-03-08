import { getSession } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/auth/action";
import { redirect } from "next/navigation";

/**
 * Server-side gating page — decides where to send the user after sign-in:
 *   • No session          → /auth/signin
 *   • Onboarding complete → /app  (workspace)
 *   • Onboarding pending  → /onboarding
 */
export default async function OnboardingCheckPage() {
	const session = await getSession();
	if (!session) redirect("/auth/signin");

	const profile = await getUserProfile();

	if (profile?.onboardingDone) {
		redirect("/");
	} else {
		redirect("/onboarding");
	}
}
