import { getLatestStrategy, getUserProfile } from "@/lib/auth/action";
import StrategyReportClient from "./_components/StrategyReportClient";

export const metadata = { title: "Application Strategy · EducAI" };

export default async function StrategyPage() {
	const [profile, strategyReport] = await Promise.all([
		getUserProfile(),
		getLatestStrategy(),
	]);

	const defaultCountry =
		profile?.targetCountries?.[0] ?? profile?.targetCountry ?? "US";

	return (
		<StrategyReportClient
			initialReport={strategyReport}
			defaultCountry={defaultCountry}
		/>
	);
}
