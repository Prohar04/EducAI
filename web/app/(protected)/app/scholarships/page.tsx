import { getEligibleScholarships, getUpcomingScholarshipDeadlines } from "@/lib/auth/action";
import ScholarshipsClient from "./_components/ScholarshipsClient";

export const metadata = { title: "Scholarships · EducAI" };

export default async function ScholarshipsPage() {
	const [deadlines, eligible] = await Promise.all([
		getUpcomingScholarshipDeadlines(90),
		getEligibleScholarships(),
	]);

	return (
		<ScholarshipsClient
			initialDeadlines={deadlines}
			initialEligible={eligible}
		/>
	);
}
