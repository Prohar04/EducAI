export type CountryOption = { code: string; name: string; flag: string };

export const COUNTRIES: CountryOption[] = [
	{ code: "US", name: "United States", flag: "🇺🇸" },
	{ code: "UK", name: "United Kingdom", flag: "🇬🇧" },
	{ code: "CA", name: "Canada", flag: "🇨🇦" },
	{ code: "AU", name: "Australia", flag: "🇦🇺" },
	{ code: "DE", name: "Germany", flag: "🇩🇪" },
	{ code: "NL", name: "Netherlands", flag: "🇳🇱" },
	{ code: "FR", name: "France", flag: "🇫🇷" },
	{ code: "SE", name: "Sweden", flag: "🇸🇪" },
	{ code: "DK", name: "Denmark", flag: "🇩🇰" },
	{ code: "NZ", name: "New Zealand", flag: "🇳🇿" },
	{ code: "SG", name: "Singapore", flag: "🇸🇬" },
	{ code: "CH", name: "Switzerland", flag: "🇨🇭" },
	{ code: "IE", name: "Ireland", flag: "🇮🇪" },
	{ code: "JP", name: "Japan", flag: "🇯🇵" },
	{ code: "KR", name: "South Korea", flag: "🇰🇷" },
];

/** Common recommended tests per destination country code */
export const COUNTRY_TESTS: Record<string, string[]> = {
	US: ["GRE", "GMAT", "TOEFL", "IELTS"],
	UK: ["IELTS", "TOEFL"],
	CA: ["IELTS", "TOEFL"],
	AU: ["IELTS", "TOEFL"],
	DE: ["IELTS", "TestDaF"],
	NL: ["IELTS", "TOEFL"],
	SG: ["IELTS", "TOEFL"],
	IE: ["IELTS", "TOEFL"],
};
