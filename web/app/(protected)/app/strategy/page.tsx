import {
	getLatestStrategy,
	getSavedPrograms,
	getUserProfile,
} from "@/lib/auth/action";
import StrategyReportClient from "./_components/StrategyReportClient";

export const metadata = { title: "Application Strategy · EducAI" };

export default async function StrategyPage() {
	const profile = await getUserProfile();

	const defaultCountry =
		profile?.targetCountries?.[0] ?? profile?.targetCountry ?? "US";

	const [strategyReport, savedPrograms] = await Promise.all([
		getLatestStrategy(defaultCountry),
		getSavedPrograms(),
	]);

	return (
		<StrategyReportClient
			initialReport={strategyReport}
			defaultCountry={defaultCountry}
			hasSavedPrograms={savedPrograms.length > 0}
		/>
	);
}
