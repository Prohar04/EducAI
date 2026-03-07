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

export const TARGET_INTAKES = [
	"Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027",
	"Fall 2027", "Spring 2028", "Fall 2028",
];

export const LEVELS = ["BSc", "MSc", "PhD", "MBA", "Diploma"] as const;
export type Level = typeof LEVELS[number];
