export type TuitionRange = {
	country: string;
	code: string;
	currency: string;
	bscMin: number;
	bscMax: number;
	mscMin: number;
	mscMax: number;
	note?: string;
};

export const TUITION_RANGES: TuitionRange[] = [
	{ country: "United States", code: "US", currency: "USD", bscMin: 25000, bscMax: 65000, mscMin: 20000, mscMax: 60000, note: "Per year. Add ~$15k/yr living costs." },
	{ country: "United Kingdom", code: "UK", currency: "GBP", bscMin: 15000, bscMax: 38000, mscMin: 15000, mscMax: 35000, note: "Per year. Post-Study Work Visa eligible." },
	{ country: "Canada", code: "CA", currency: "CAD", bscMin: 20000, bscMax: 45000, mscMin: 15000, mscMax: 40000, note: "PR pathway strong via PGWP." },
	{ country: "Australia", code: "AU", currency: "AUD", bscMin: 25000, bscMax: 45000, mscMin: 22000, mscMax: 42000, note: "2-4yr post-study work rights." },
	{ country: "Germany", code: "DE", currency: "EUR", bscMin: 0, bscMax: 3000, mscMin: 0, mscMax: 5000, note: "Many public unis are tuition-free. Semester fee ~300€." },
	{ country: "Netherlands", code: "NL", currency: "EUR", bscMin: 8000, bscMax: 20000, mscMin: 8000, mscMax: 20000, note: "English-taught programs widely available." },
	{ country: "Sweden", code: "SE", currency: "SEK", bscMin: 80000, bscMax: 200000, mscMin: 80000, mscMax: 200000, note: "Non-EU students pay fees. Scholarships available." },
	{ country: "Singapore", code: "SG", currency: "SGD", bscMin: 25000, bscMax: 50000, mscMin: 20000, mscMax: 45000, note: "Strong ROI and regional hub." },
];

export function getTuitionForCountries(codes: string[]): TuitionRange[] {
	return TUITION_RANGES.filter((t) => codes.includes(t.code));
}

export const PRIORITIES = [
	{ value: "low_tuition", label: "Low tuition", icon: "💰" },
	{ value: "scholarships", label: "Scholarship chances", icon: "🏆" },
	{ value: "ranking", label: "University ranking", icon: "📊" },
	{ value: "job_outcome", label: "Job outcomes", icon: "💼" },
	{ value: "pr_pathway", label: "PR / Immigration pathway", icon: "🌍" },
	{ value: "research", label: "Research opportunities", icon: "🔬" },
	{ value: "industry_links", label: "Industry connections", icon: "🤝" },
];

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "INR", "BDT"];
