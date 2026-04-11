import { getUserProfile, getSavedPrograms } from "@/lib/auth/action";
import AgentPageClient from "./_components/AgentPageClient";

export const metadata = { title: "AI Assistant · EducAI" };

export default async function AgentPage() {
	const [profile, savedPrograms] = await Promise.all([
		getUserProfile(),
		getSavedPrograms(),
	]);

	return (
		<AgentPageClient
			profileName={profile?.majorOrTrack ?? profile?.intendedMajor ?? null}
			targetCountries={(profile?.targetCountries as string[] | null) ?? null}
			savedProgramCount={savedPrograms.length}
		/>
	);
}
