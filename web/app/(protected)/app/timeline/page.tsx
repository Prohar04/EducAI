import {
	getLatestTimeline,
	getTimelineInputs,
	getUserProfile,
} from "@/lib/auth/action";
import TimelinePlannerClient from "./_components/TimelinePlannerClient";

export const metadata = { title: "Application Timeline · EducAI" };

export default async function TimelinePage() {
	const profile = await getUserProfile();

	const defaultCountry =
		profile?.targetCountries?.[0] ?? profile?.targetCountry ?? "US";

	const [roadmap, initialInputs] = await Promise.all([
		getLatestTimeline(defaultCountry),
		getTimelineInputs(defaultCountry),
	]);

	return (
		<TimelinePlannerClient
			initialRoadmap={roadmap}
			initialInputs={initialInputs}
			defaultCountry={defaultCountry}
		/>
	);
}
