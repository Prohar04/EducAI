export type StageOption = {
	value: string;
	label: string;
	description: string;
	tip: string;
};

export const STAGES: StageOption[] = [
	{
		value: "high_school",
		label: "High School / A-Levels",
		description: "You're finishing secondary school and targeting undergraduate programs.",
		tip: "Start with SAT/ACT preparation. Research universities 18+ months ahead.",
	},
	{
		value: "undergraduate",
		label: "Undergraduate (BSc/BA)",
		description: "You're currently in or completing a bachelor's degree.",
		tip: "A GPA of 3.5+ (4.0 scale) significantly broadens your MSc options.",
	},
	{
		value: "graduate",
		label: "Graduate (MSc/MA)",
		description: "You hold a master's degree and are targeting PhD or executive programs.",
		tip: "Strong research or work experience is crucial at this stage.",
	},
	{
		value: "professional",
		label: "Working Professional",
		description: "You're employed and looking to upskill with a part-time or full-time degree.",
		tip: "MBA, executive MSc, and online programs are designed for your profile.",
	},
	{
		value: "gap_year",
		label: "Gap Year",
		description: "You're taking time off between studies or work.",
		tip: "Use this time to build volunteering, research, or language credentials.",
	},
];

export function getAvailableIntakes(): Array<{ value: string; label: string }> {
	const now = new Date();
	const currentYear = now.getFullYear();

	const intakeMonths = [
		{ month: 1, label: "January" },
		{ month: 5, label: "May" },
		{ month: 9, label: "September" },
	];

	const result: Array<{ value: string; label: string }> = [];

	for (let yearOffset = 0; yearOffset <= 2; yearOffset++) {
		const year = currentYear + yearOffset;
		for (const { month, label } of intakeMonths) {
			const intakeDate = new Date(year, month - 1, 1);
			const diffMs = intakeDate.getTime() - now.getTime();
			const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
			if (diffMonths > 1) {
				result.push({ value: `${label} ${year}`, label: `${label} ${year}` });
			}
		}
	}

	return result.slice(0, 8);
}

export const TARGET_INTAKES = getAvailableIntakes().map((i) => i.value);

export const LEVELS = ["BSc", "MSc", "PhD", "MBA", "Diploma"] as const;
export type Level = typeof LEVELS[number];
