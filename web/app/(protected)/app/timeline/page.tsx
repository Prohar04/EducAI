import { getLatestTimeline, getUserProfile } from "@/lib/auth/action";
import TimelinePlannerClient from "./_components/TimelinePlannerClient";

export const metadata = { title: "Application Timeline · EducAI" };

export default async function TimelinePage() {
	const [profile, roadmap] = await Promise.all([
		getUserProfile(),
		getLatestTimeline(),
	]);

	const defaultCountry =
		profile?.targetCountries?.[0] ?? profile?.targetCountry ?? "US";

	return (
		<TimelinePlannerClient
			initialRoadmap={roadmap}
			defaultCountry={defaultCountry}
		/>
	);
}
