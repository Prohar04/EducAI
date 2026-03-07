export type MajorOption = { value: string; label: string; field: string };

export const MAJORS: MajorOption[] = [
	// Computer Science & Engineering
	{ value: "computer_science", label: "Computer Science", field: "Engineering & Tech" },
	{ value: "software_engineering", label: "Software Engineering", field: "Engineering & Tech" },
	{ value: "data_science", label: "Data Science & AI", field: "Engineering & Tech" },
	{ value: "electrical_engineering", label: "Electrical Engineering", field: "Engineering & Tech" },
	{ value: "mechanical_engineering", label: "Mechanical Engineering", field: "Engineering & Tech" },
	{ value: "civil_engineering", label: "Civil Engineering", field: "Engineering & Tech" },
	{ value: "biomedical_engineering", label: "Biomedical Engineering", field: "Engineering & Tech" },
	{ value: "cybersecurity", label: "Cybersecurity", field: "Engineering & Tech" },
	// Business
	{ value: "business_administration", label: "Business Administration", field: "Business" },
	{ value: "finance", label: "Finance", field: "Business" },
	{ value: "accounting", label: "Accounting", field: "Business" },
	{ value: "marketing", label: "Marketing", field: "Business" },
	{ value: "supply_chain", label: "Supply Chain Management", field: "Business" },
	{ value: "entrepreneurship", label: "Entrepreneurship", field: "Business" },
	// Natural Sciences
	{ value: "biology", label: "Biology", field: "Natural Sciences" },
	{ value: "chemistry", label: "Chemistry", field: "Natural Sciences" },
	{ value: "physics", label: "Physics", field: "Natural Sciences" },
	{ value: "environmental_science", label: "Environmental Science", field: "Natural Sciences" },
	// Social Sciences & Humanities
	{ value: "economics", label: "Economics", field: "Social Sciences" },
	{ value: "psychology", label: "Psychology", field: "Social Sciences" },
	{ value: "political_science", label: "Political Science", field: "Social Sciences" },
	{ value: "public_policy", label: "Public Policy", field: "Social Sciences" },
	{ value: "sociology", label: "Sociology", field: "Social Sciences" },
	// Health
	{ value: "public_health", label: "Public Health", field: "Health" },
	{ value: "nursing", label: "Nursing", field: "Health" },
	{ value: "medicine", label: "Medicine (MBBS/MD)", field: "Health" },
	{ value: "pharmacy", label: "Pharmacy", field: "Health" },
	// Arts & Design
	{ value: "architecture", label: "Architecture", field: "Arts & Design" },
	{ value: "graphic_design", label: "Graphic Design", field: "Arts & Design" },
	{ value: "fine_arts", label: "Fine Arts", field: "Arts & Design" },
	// Law
	{ value: "law", label: "Law (LLB/LLM)", field: "Law" },
];

export const MAJOR_FIELDS = [...new Set(MAJORS.map((m) => m.field))];

/** Returns suggested fields/programs for a given major value */
export function suggestRelatedPrograms(majorValue: string): string[] {
	const suggestions: Record<string, string[]> = {
		computer_science: ["MSc Computer Science", "MSc Artificial Intelligence", "MEng Software Systems"],
		data_science: ["MSc Data Science", "MSc Machine Learning", "MSc Statistics with Data Science"],
		business_administration: ["MBA", "MSc Management", "MSc International Business"],
		finance: ["MSc Finance", "MSc Financial Engineering", "MBA Finance"],
		economics: ["MSc Economics", "MSc Development Economics", "MBA Economics"],
	};
	return suggestions[majorValue] ?? [];
}
