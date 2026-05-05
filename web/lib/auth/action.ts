"use server";

import { revalidatePath } from "next/cache";
import { BACKEND_URL } from "@/constants/constants";
import { authFetch } from "./authFetch";
import {
	UserProfile,
	Program,
	ProgramListResult,
	SavedProgramItem,
	MatchLatestResponse,
	MatchRunFormState,
	ScholarshipListResult,
	ScholarshipItem,
	EligibilityResult,
	ProbabilityResult,
	UpcomingDeadlineItem,
	EligibleScholarshipItem,
	AlertNotification,
} from "@/types/auth.type";

const HTTP_STATUS_TEXT: Record<number, string> = {
	400: "Bad request",
	401: "Unauthorised — please sign in again",
	403: "Forbidden",
	404: "Endpoint not found",
	429: "Too many requests — please wait a moment",
	500: "Server error",
	502: "Server unavailable",
	503: "Service unavailable",
};

export const getProfile = async () => {
	const response = await authFetch(`${BACKEND_URL}/auth/me`);
	const result = await response.json();
	return result;
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
	const response = await authFetch(`${BACKEND_URL}/users/me/profile`);
	if (!response.ok) return null;
	const result = await response.json();
	return result.profile;
};

export const upsertUserProfile = async (
	_prev: unknown,
	formData: FormData,
) => {
	const body: Partial<UserProfile> = {
		// Legacy
		targetCountry: (formData.get("targetCountry") as string) || undefined,
		level: (formData.get("level") as string) || undefined,
		budgetRange: (formData.get("budgetRange") as string) || undefined,
		intendedMajor: (formData.get("intendedMajor") as string) || undefined,
		gpa: formData.get("gpa") ? Number(formData.get("gpa")) : undefined,
		onboardingDone: formData.get("onboardingDone") === "true" ? true : undefined,
		// Step 1
		currentStage: (formData.get("currentStage") as string) || undefined,
		targetIntake: (formData.get("targetIntake") as string) || undefined,
		intendedLevel: (formData.get("intendedLevel") as string) || undefined,
		// Step 2
		currentInstitution: (formData.get("currentInstitution") as string) || undefined,
		majorOrTrack: (formData.get("majorOrTrack") as string) || undefined,
		gpaScale: (formData.get("gpaScale") as string) || undefined,
		graduationYear: formData.get("graduationYear") ? Number(formData.get("graduationYear")) : undefined,
		backlogs: formData.get("backlogs") ? Number(formData.get("backlogs")) : undefined,
		workExperienceMonths: formData.get("workExperienceMonths") ? Number(formData.get("workExperienceMonths")) : undefined,
		// Step 3
		englishTestType: (formData.get("englishTestType") as string) || undefined,
		englishScore: formData.get("englishScore") ? Number(formData.get("englishScore")) : undefined,
		gre: formData.get("gre") ? Number(formData.get("gre")) : undefined,
		gmat: formData.get("gmat") ? Number(formData.get("gmat")) : undefined,
		// Step 4
		budgetCurrency: (formData.get("budgetCurrency") as string) || undefined,
		budgetMax: formData.get("budgetMax") ? Number(formData.get("budgetMax")) : undefined,
		fundingNeed: formData.get("fundingNeed") !== null ? formData.get("fundingNeed") === "true" : undefined,
	};

	// JSON array fields
	const targetCountriesRaw = formData.get("targetCountries") as string;
	if (targetCountriesRaw) {
		try { body.targetCountries = JSON.parse(targetCountriesRaw); } catch { /* ignore */ }
	}
	const preferredCitiesRaw = formData.get("preferredCities") as string;
	if (preferredCitiesRaw) {
		try { body.preferredCities = JSON.parse(preferredCitiesRaw); } catch { /* ignore */ }
	}
	const prioritiesRaw = formData.get("priorities") as string;
	if (prioritiesRaw) {
		try { body.priorities = JSON.parse(prioritiesRaw); } catch { /* ignore */ }
	}
	const rawTestScores = formData.get("testScores") as string;
	if (rawTestScores) {
		try { body.testScores = JSON.parse(rawTestScores); } catch { /* ignore */ }
	}

	const response = await authFetch(`${BACKEND_URL}/users/me/profile`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => null);
		const msg = errData?.message ?? `Server error (${response.status}). Please try again.`;
		return { success: false, message: msg };
	}

	revalidatePath("/app");
	revalidatePath("/app/profile");
	return { success: true, message: "Profile saved!" };
};

// ─── Module 1: Programs ──────────────────────────────────────────────────────

export const searchPrograms = async (
	params: Record<string, string> = {},
): Promise<ProgramListResult | null> => {
	const qs = new URLSearchParams(params).toString();
	const url = qs ? `${BACKEND_URL}/programs?${qs}` : `${BACKEND_URL}/programs`;
	const response = await authFetch(url);
	if (!response.ok) return null;
	return response.json();
};

export const getProgramById = async (id: string): Promise<Program | null> => {
	const response = await authFetch(`${BACKEND_URL}/programs/${encodeURIComponent(id)}`);
	if (!response.ok) return null;
	return response.json();
};

// matchPrograms removed — use triggerMatchRun() + getMatchLatest() for the
// background AI scrape-and-rank flow (POST /match/run → GET /match/latest).

// ─── Module 1: Saved Programs ─────────────────────────────────────────────────

export const getSavedPrograms = async (): Promise<SavedProgramItem[]> => {
	const response = await authFetch(`${BACKEND_URL}/saved-programs`);
	if (!response.ok) return [];
	const data = await response.json();
	return data.savedPrograms ?? [];
};

export const saveProgram = async (programId: string): Promise<boolean> => {
	const response = await authFetch(`${BACKEND_URL}/saved-programs`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ programId }),
	});
	revalidatePath("/app/saved");
	return response.ok;
};

export const unsaveProgram = async (programId: string): Promise<boolean> => {
	const response = await authFetch(
		`${BACKEND_URL}/saved-programs/${encodeURIComponent(programId)}`,
		{ method: "DELETE" },
	);
	revalidatePath("/app/saved");
	return response.ok;
};

// ─── Match Run ────────────────────────────────────────────────────────────────

export const triggerMatchRun = async (): Promise<MatchRunFormState> => {
	const response = await authFetch(`${BACKEND_URL}/match/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => null);
		const statusText = HTTP_STATUS_TEXT[response.status] ?? "Unexpected error";
		const msg =
			errData?.message ??
			`Match failed (${response.status}). ${statusText}.`;
		return { success: false, message: msg };
	}

	const data = await response.json();
	return { success: true, runId: data.runId };
};

export const getMatchLatest = async (): Promise<MatchLatestResponse | null> => {
	const response = await authFetch(`${BACKEND_URL}/match/latest`);
	if (!response.ok) return null;
	return response.json();
};

export const getMatchRunStatus = async (
	runId: string,
): Promise<import("@/types/auth.type").MatchRunStatus | null> => {
	const response = await authFetch(
		`${BACKEND_URL}/match/run/${encodeURIComponent(runId)}/status`,
	);
	if (!response.ok) return null;
	return response.json();
};

export const updateUserProfile = async (
	profileData: Partial<import("@/types/auth.type").UserProfile>,
): Promise<{ success: boolean; message: string }> => {
	const response = await authFetch(`${BACKEND_URL}/users/me/profile`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(profileData),
	});

	if (!response.ok) {
		return { success: false, message: "Failed to update profile." };
	}

	// Trigger a new match run after profile update
	await authFetch(`${BACKEND_URL}/match/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	}).catch(() => null); // Don't fail if match trigger fails

	revalidatePath("/app/dashboard");
	revalidatePath("/app/match");
	return { success: true, message: "Profile updated. Refreshing matches…" };
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const getTimelineInputs = async (countryCode?: string) => {
	const qs = countryCode ? `?countryCode=${encodeURIComponent(countryCode)}` : "";
	const response = await authFetch(`${BACKEND_URL}/timeline/inputs${qs}`);
	if (!response.ok) return null;
	return response.json();
};

export const generateTimeline = async (
	countryCode: string,
	intake?: string,
): Promise<{ success: boolean; data?: unknown; message?: string }> => {
	const response = await authFetch(`${BACKEND_URL}/timeline/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ countryCode, intake }),
	});
	if (!response.ok) {
		const err = await response.json().catch(() => null);
		return { success: false, message: err?.message ?? "Failed to generate timeline" };
	}
	const data = await response.json();
	revalidatePath("/app/timeline");
	return { success: true, data };
};

export const getLatestTimeline = async (countryCode?: string) => {
	const qs = countryCode ? `?countryCode=${encodeURIComponent(countryCode)}` : "";
	const response = await authFetch(`${BACKEND_URL}/timeline/latest${qs}`);
	if (!response.ok) return null;
	return response.json();
};

export const updateTaskStatus = async (
	roadmapId: string,
	taskId: string,
	status: "pending" | "in_progress" | "completed" | "overdue",
): Promise<{ success: boolean; data?: unknown; message?: string }> => {
	const response = await authFetch(`${BACKEND_URL}/timeline/tasks`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ roadmapId, taskId, status }),
	});
	if (!response.ok) {
		const err = await response.json().catch(() => null);
		return { success: false, message: err?.message ?? "Failed to update task" };
	}
	const data = await response.json();
	return { success: true, data };
};

// ─── Strategy ─────────────────────────────────────────────────────────────────

export const generateStrategy = async (
	countryCode: string,
	intake?: string,
	focusProgramIds?: string[],
): Promise<{ success: boolean; data?: unknown; message?: string }> => {
	const response = await authFetch(`${BACKEND_URL}/strategy/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ countryCode, intake, focusProgramIds }),
	});
	if (!response.ok) {
		const err = await response.json().catch(() => null);
		return { success: false, message: err?.message ?? "Failed to generate strategy" };
	}
	const data = await response.json();
	revalidatePath("/app/strategy");
	return { success: true, data };
};

export const getLatestStrategy = async (countryCode?: string) => {
	const qs = countryCode ? `?countryCode=${encodeURIComponent(countryCode)}` : "";
	const response = await authFetch(`${BACKEND_URL}/strategy/latest${qs}`);
	if (!response.ok) return null;
	return response.json();
};

// ─── Module 2: Scholarships ──────────────────────────────────────────────────

export const searchScholarships = async (
	params: Record<string, string> = {},
): Promise<ScholarshipListResult | null> => {
	const qs = new URLSearchParams(params).toString();
	const url = qs
		? `${BACKEND_URL}/scholarships?${qs}`
		: `${BACKEND_URL}/scholarships`;
	const response = await authFetch(url);
	if (!response.ok) return null;
	return response.json();
};

export const getScholarshipById = async (id: string): Promise<ScholarshipItem | null> => {
	const response = await authFetch(
		`${BACKEND_URL}/scholarships/${encodeURIComponent(id)}`,
	);
	if (!response.ok) return null;
	return response.json();
};

export const getEligibleScholarships = async (): Promise<EligibleScholarshipItem[]> => {
	const response = await authFetch(`${BACKEND_URL}/scholarships/eligible`);
	if (!response.ok) return [];
	const data = await response.json();
	return data.items ?? [];
};

export const getUpcomingScholarshipDeadlines = async (
	daysAhead = 90,
): Promise<UpcomingDeadlineItem[]> => {
	const response = await authFetch(
		`${BACKEND_URL}/scholarships/deadlines?daysAhead=${daysAhead}`,
	);
	if (!response.ok) return [];
	const data = await response.json();
	return data.deadlines ?? [];
};

export const checkScholarshipEligibility = async (
	scholarshipId: string,
): Promise<EligibilityResult | null> => {
	const response = await authFetch(
		`${BACKEND_URL}/scholarships/${encodeURIComponent(scholarshipId)}/eligibility`,
		{ method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
	);
	if (!response.ok) return null;
	return response.json();
};

export const getScholarshipProbability = async (
	scholarshipId: string,
): Promise<ProbabilityResult | null> => {
	const response = await authFetch(
		`${BACKEND_URL}/scholarships/${encodeURIComponent(scholarshipId)}/probability`,
		{ method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
	);
	if (!response.ok) return null;
	return response.json();
};

// ── Deadline Alerts ─────────────────────────────────────────────────────────

export const getAlertNotifications = async (): Promise<AlertNotification[]> => {
	const response = await authFetch(`${BACKEND_URL}/deadline-alerts/recent`);
	if (!response.ok) return [];
	const data = await response.json();
	return data.alerts ?? [];
};

export const getAlertCount = async (): Promise<number> => {
	const response = await authFetch(`${BACKEND_URL}/deadline-alerts/count`);
	if (!response.ok) return 0;
	const data = await response.json();
	return data.count ?? 0;
};

// ── Unified Notifications ────────────────────────────────────────────────────

export type NotificationType =
	| "scholarship_alert"
	| "profile_incomplete"
	| "match_ready"
	| "sop_ready"
	| "cv_ready"
	| "system";

export interface AppNotification {
	id: string;
	type: NotificationType;
	title: string;
	body: string;
	href: string;
	read: boolean;
	createdAt: string;
}

export const getUnifiedNotifications = async (): Promise<AppNotification[]> => {
	const notifications: AppNotification[] = [];

	// 1. Scholarship deadline alerts from backend
	try {
		const alertsResponse = await authFetch(`${BACKEND_URL}/deadline-alerts/recent`);
		if (alertsResponse.ok) {
			const data = await alertsResponse.json();
			const alerts: AlertNotification[] = data.alerts ?? [];
			for (const alert of alerts.slice(0, 5)) {
				notifications.push({
					id: `alert-${alert.id}`,
					type: "scholarship_alert",
					title: alert.scholarshipTitle,
					body: `Deadline alert — ${alert.daysBeforeSent} days before deadline${alert.provider ? ` · ${alert.provider}` : ""}`,
					href: alert.scholarshipUrl ?? "/app/scholarships",
					read: false,
					createdAt: alert.sentAt,
				});
			}
		}
	} catch {
		// Non-critical — continue with other notification sources
	}

	// 2. Profile completeness check
	try {
		const profileResponse = await authFetch(`${BACKEND_URL}/users/profile`);
		if (profileResponse.ok) {
			const profile = await profileResponse.json() as Record<string, unknown>;
			const fields = [
				profile.currentStage, profile.targetIntake, profile.intendedLevel,
				profile.intendedMajor, profile.targetCountries, profile.gpa,
				profile.englishTestType, profile.budgetMax,
			];
			const filled = fields.filter(f => f !== null && f !== undefined).length;
			const completeness = Math.round((filled / fields.length) * 100);
			if (completeness < 80) {
				notifications.push({
					id: "profile-incomplete",
					type: "profile_incomplete",
					title: "Complete your profile",
					body: `Your profile is ${completeness}% complete. Add more details to get better match results.`,
					href: "/app/profile",
					read: false,
					createdAt: new Date().toISOString(),
				});
			}
		}
	} catch {
		// Non-critical
	}

	// 3. Match results — notify if a recent run completed
	try {
		const matchResponse = await authFetch(`${BACKEND_URL}/match/latest`);
		if (matchResponse.ok) {
			const match = await matchResponse.json() as { run?: { status?: string; createdAt?: string } };
			if (match?.run?.status === "done" && match.run.createdAt) {
				const ageMs = Date.now() - new Date(match.run.createdAt).getTime();
				// Show only if completed within the last 48 hours
				if (ageMs < 48 * 60 * 60 * 1000) {
					notifications.push({
						id: "match-ready",
						type: "match_ready",
						title: "Match results ready",
						body: "Your AI program match is complete — view your personalised recommendations.",
						href: "/app/match",
						read: false,
						createdAt: match.run.createdAt,
					});
				}
			}
		}
	} catch {
		// Non-critical
	}

	// Sort by createdAt descending (most recent first)
	notifications.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	return notifications;
};

// ── Intelligent Search ────────────────────────────────────────────────────────

export interface IntelligentSearchResult {
	title: string;
	url: string;
	snippet: string;
}

export interface IntelligentSearchResponse {
	cacheHit: boolean;
	query: string;
	rewrites: string[];
	results: IntelligentSearchResult[];
	cachedAt: string | null;
	expiresAt: string | null;
}

export const intelligentSearchAction = async (
	query: string,
): Promise<IntelligentSearchResponse | null> => {
	if (!query.trim()) return null;
	const response = await authFetch(`${BACKEND_URL}/search/intelligent`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query }),
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 3: SOP Builder ─────────────────────────────────────────────────────

export type SopTone = "formal" | "research" | "personal";
export type SopType = "general" | "scholarship" | "research";
export type SopTemplate =
	| "formal-academic"
	| "research-focused"
	| "scholarship-focused"
	| "personal-story"
	| "professional-career"
	| "technical-engineering"
	| "business-management"
	| "compact-direct"
	| "highly-persuasive"
	| "phd-proposal";

export interface SopGenerateRequest {
	sopTemplate: SopTemplate;
	targetProgram?: string;
	targetUniversity?: string;
	targetCountry?: string;
	targetIntake?: string;
	degreeLevel?: string;
	highlights?: string;
	sopPurpose?: string;
	academicBackground?: string;
	motivation?: string;
	whySubject?: string;
	whyUniversity?: string;
	whyCountry?: string;
	careerGoals?: string;
	researchInterests?: string;
	achievements?: string;
	workExperience?: string;
	projects?: string;
	challengesOvercome?: string;
	scholarshipAngle?: string;
	// Legacy
	tone?: SopTone;
	sopType?: SopType;
}

export interface SopResult {
	sop: string;
	wordCount: number;
	template: SopTemplate;
	sopType: SopType;
}

export const generateSopAction = async (req: SopGenerateRequest): Promise<SopResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/sop/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req),
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 3: CV Builder ──────────────────────────────────────────────────────

export type CvStyle = "academic" | "research" | "industry";
export type CvTemplate =
	| "minimal-academic"
	| "research-focused"
	| "modern-professional"
	| "scholarship-focused"
	| "international-student"
	| "technical-engineering"
	| "business-management"
	| "clean-classic"
	| "compact-one-page"
	| "phd-research";

export interface CvGenerateRequest {
	cvTemplate: CvTemplate;
	highlights?: string;
	phone?: string;
	linkedin?: string;
	github?: string;
	summary?: string;
	thesisOrResearch?: string;
	publications?: string;
	workExperience?: string;
	internships?: string;
	technicalSkills?: string;
	softSkills?: string;
	projects?: string;
	certifications?: string;
	awards?: string;
	extracurriculars?: string;
	volunteering?: string;
	references?: string;
	targetDegree?: string;
	targetCountry?: string;
	targetUniversity?: string;
	targetProgram?: string;
}

export interface CvResult {
	cv: string;
	template: CvTemplate;
	sections: string[];
}

export const generateCvAction = async (req: CvGenerateRequest): Promise<CvResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/cv/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req),
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 3: Professor Finder ────────────────────────────────────────────────

export interface ProfessorResult {
	name: string;
	title: string;
	university: string;
	department: string;
	researchAreas: string[];
	email: string | null;
	profileUrl: string | null;
	snippet: string;
	emailTemplate: string;
	sourceVerified: boolean;
}

export interface ProfessorSearchResponseFull {
	query: string;
	results: ProfessorResult[];
	searchedAt: string;
	warning?: string;
}

export interface ProfessorSearchResponse {
	query: string;
	results: ProfessorResult[];
	searchedAt: string;
	warning?: string;
}

export const searchProfessorsAction = async (
	researchInterest: string,
	university?: string,
	country?: string,
	level?: "phd" | "masters",
): Promise<ProfessorSearchResponse | null> => {
	if (!researchInterest.trim()) return null;
	const response = await authFetch(`${BACKEND_URL}/professors/search`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ researchInterest, university, country, level }),
	});
	if (!response.ok) {
		const data = await response.json().catch(() => ({})) as { error?: string; detail?: string };
		if (response.status === 400) {
			throw new Error(data.error ?? "Invalid input");
		}
		if (response.status === 503) {
			throw new Error(data.detail ?? data.error ?? "Professor search is not available in this deployment. The search provider is not configured.");
		}
		throw new Error(data.error ?? "Search failed. Please try again.");
	}
	return response.json();
};

// ── Module 3: Gap Fix Recommender ────────────────────────────────────────────

export interface GapFixRecommendation {
	id: string;
	category: string;
	priority: "high" | "medium" | "low";
	title: string;
	description: string;
	actions: string[];
	resources: string[];
	timelineWeeks: number;
}

export interface GapFixResult {
	profileScore: number;
	strengths: string[];
	weaknesses: string[];
	recommendations: GapFixRecommendation[];
	prioritySummary: string;
	generatedAt: string;
}

export type GapStatus = "not_started" | "in_progress" | "completed" | "skipped";

export interface ImprovementEntry {
	id: string;
	type: string;
	description: string;
	testType?: string;
	scoreValue?: number;
	addedAt: string;
	appliedToProfile: boolean;
}

export interface GapFixEvidenceItem {
	id: string;
	sessionId: string;
	userId: string;
	recId: string;
	type: string;
	label: string;
	url?: string | null;
	fileName?: string | null;
	fileSize?: number | null;
	status: string;
	uploadedAt: string;
}

export interface GapFixComparison {
	previousScore: number;
	currentScore: number;
	scoreImprovement: number;
	previousStrengths: string[];
	newStrengths: string[];
	resolvedGaps: string[];
	remainingGaps: string[];
	newGaps: string[];
}

export interface GapFixSession {
	id: string;
	userId: string;
	result: GapFixResult;
	gapStatuses: Record<string, GapStatus>;
	improvements: ImprovementEntry[];
	profileSnapshot: Record<string, unknown>;
	previousSessionId?: string | null;
	previousResult?: GapFixResult | null;
	comparison?: GapFixComparison | null;
	evidences: GapFixEvidenceItem[];
	analysisMode?: "full" | "partial" | "minimal";
	createdAt: string;
	updatedAt: string;
}

// Analyze and persist a new session
export const analyzeGapFixAction = async (): Promise<{ session: GapFixSession; error: null } | { session: null; error: string }> => {
	try {
		const response = await authFetch(`${BACKEND_URL}/gap-fix/analyze`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}",
		});
		if (!response.ok) {
			const errData = await response.json().catch(() => null);
			return { session: null, error: errData?.error ?? "Analysis failed. Please try again." };
		}
		const session = await response.json();
		return { session, error: null };
	} catch {
		return { session: null, error: "Could not reach the server. Please check your connection and try again." };
	}
};

// Fetch the latest saved session
export const getGapFixSessionAction = async (): Promise<GapFixSession | null> => {
	const response = await authFetch(`${BACKEND_URL}/gap-fix/session`);
	if (!response.ok) return null;
	return response.json();
};

// Update one gap's progress status
export const updateGapStatusAction = async (
	sessionId: string,
	recId: string,
	status: GapStatus,
): Promise<boolean> => {
	const response = await authFetch(`${BACKEND_URL}/gap-fix/session/${sessionId}/status`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ recId, status }),
	});
	return response.ok;
};

// Add an improvement log entry (optionally updates profile for test scores)
export const addImprovementAction = async (
	sessionId: string,
	entry: {
		type: string;
		description: string;
		testType?: string;
		scoreValue?: number;
		applyToProfile?: boolean;
	},
): Promise<GapFixSession | null> => {
	const response = await authFetch(`${BACKEND_URL}/gap-fix/session/${sessionId}/improvement`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(entry),
	});
	if (!response.ok) return null;
	return response.json();
};

// Attach a link as evidence for a gap
export const addEvidenceLinkAction = async (
	sessionId: string,
	recId: string,
	label: string,
	type: string,
	url: string,
): Promise<GapFixEvidenceItem | null> => {
	const response = await authFetch(`${BACKEND_URL}/gap-fix/session/${sessionId}/evidence`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ recId, type, label, url }),
	});
	if (!response.ok) return null;
	return response.json();
};

// Upload a file as evidence for a gap
export const uploadEvidenceAction = async (
	sessionId: string,
	recId: string,
	formData: FormData,
): Promise<GapFixEvidenceItem | null> => {
	formData.set("recId", recId);
	const response = await authFetch(`${BACKEND_URL}/gap-fix/session/${sessionId}/evidence`, {
		method: "POST",
		body: formData,
	});
	if (!response.ok) return null;
	return response.json();
};

// Delete an evidence entry
export const deleteEvidenceAction = async (evidenceId: string): Promise<boolean> => {
	const response = await authFetch(`${BACKEND_URL}/gap-fix/evidence/${evidenceId}`, {
		method: "DELETE",
	});
	return response.ok;
};

// Re-run analysis against current profile, creating a new session with comparison
export const reanalyzeGapFixAction = async (sessionId: string): Promise<GapFixSession | null> => {
	const response = await authFetch(`${BACKEND_URL}/gap-fix/session/${sessionId}/reanalyze`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
	});
	if (!response.ok) return null;
	return response.json();
};

/** @deprecated use analyzeGapFixAction */
export const generateGapFixAction = analyzeGapFixAction;

// ── Module 4: Career Outcome Predictor ──────────────────────────────────────

export interface CareerOutlookFactor {
	factor: string;
	rating: "Strong" | "Good" | "Moderate" | "Weak";
	explanation: string;
}

export interface CareerPathway {
	role: string;
	sector: string;
	salaryRangeUsd: string;
	demandLevel: "High" | "Medium" | "Low";
	timeToEntry: string;
}

export interface CareerResult {
	overallOutlook: "Excellent" | "Good" | "Moderate" | "Challenging";
	outlookSummary: string;
	employabilityScore: number;
	topCountry: string;
	factors: CareerOutlookFactor[];
	pathways: CareerPathway[];
	keySkillsToAdd: string[];
	industryTrends: string[];
	disclaimer: string;
	generatedAt: string;
}

export const predictCareerAction = async (): Promise<CareerResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/career/predict`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 4: PR & Immigration Engine ────────────────────────────────────────

export interface ImmigrationStep {
	phase: string;
	title: string;
	description: string;
	typicalDuration: string;
	keyCriteria: string[];
	pitfalls: string[];
}

export interface CountryPathway {
	countryCode: string;
	countryName: string;
	overallFeasibility: "High" | "Medium" | "Low";
	feasibilityReason: string;
	studyVisaType: string;
	postStudyWorkVisa: string;
	postStudyWorkDuration: string;
	prPathway: string;
	prTimeline: string;
	pointsRequired?: number;
	estimatedPoints?: number;
	steps: ImmigrationStep[];
	advantages: string[];
	challenges: string[];
	officialSource: string;
}

export interface ImmigrationResult {
	pathways: CountryPathway[];
	bestFitCountry: string;
	bestFitReason: string;
	generalTips: string[];
	disclaimer: string;
	lastUpdated: string;
	generatedAt: string;
}

export const getImmigrationGuideAction = async (): Promise<ImmigrationResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/immigration/guide`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 4: Data Sync Agent ─────────────────────────────────────────────────

export type SyncStatus = "running" | "success" | "partial_success" | "failed" | "cancelled" | "idle";
export type SyncTarget = "scholarships" | "programs" | "all";

export interface CrawlerDetails {
	taskId?: string;
	preferences?: { countries: string[]; fields: string[]; levels: string[] };
	programCountBefore?: number;
	programCountAfter?: number;
	pipelineStatus?: string;
	aiServerUrl?: string;
}

export interface SourceResult {
	sourceKey: string;
	label: string;
	status: SyncStatus;
	recordsProcessed: number;
	recordsAdded: number;
	recordsUpdated: number;
	recordsSkipped: number;
	notes: string[];
	errors: string[];
	durationMs: number;
	crawlerDetails?: CrawlerDetails;
	rawLogs?: string[];
}

export interface SyncRunResult {
	jobId: string;
	target: SyncTarget;
	status: SyncStatus;
	queueState: string;
	triggerType: "manual" | "cron" | "system";
	triggeredBy: string;
	startedAt: string;
	finishedAt: string;
	durationMs: number;
	recordsProcessed: number;
	recordsAdded: number;
	recordsUpdated: number;
	recordsSkipped: number;
	sources: SourceResult[];
	errorSummary: string | null;
	rawLogs: string[];
	crawlerDetails: CrawlerDetails | null;
	stackTrace: string | null;
}

export interface SyncSourceHealth {
	sourceKey: string;
	label: string;
	description: string;
	lastRunAt: string | null;
	lastSuccessAt: string | null;
	lastStatus: SyncStatus;
	isStale: boolean;
	staleSinceHours: number | null;
	recordCount: number;
	lastRunId: string | null;
}

export interface SyncStatusResponse {
	sources: SyncSourceHealth[];
	activeJob: { jobId: string; sourceKey: string; startedAt: string; queueState: string } | null;
	recentRuns: SyncRunResult[];
	totalRuns: number;
	successRate: number;
	nextScheduledRun: string;
	summary: {
		totalSources: number;
		healthySources: number;
		staleSources: number;
		failedLastRun: number;
		running: number;
		totalRecordsManaged: number;
	};
}

export const getDataSyncStatusAction = async (): Promise<SyncStatusResponse | null> => {
	const response = await authFetch(`${BACKEND_URL}/data-sync/status`);
	if (!response.ok) return null;
	return response.json();
};

export const getDataSyncHistoryAction = async (limit = 20): Promise<{ runs: SyncRunResult[]; total: number } | null> => {
	const response = await authFetch(`${BACKEND_URL}/data-sync/history?limit=${limit}`);
	if (!response.ok) return null;
	return response.json();
};

export const getJobDetailsAction = async (jobId: string): Promise<SyncRunResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/data-sync/job/${jobId}`);
	if (!response.ok) return null;
	return response.json();
};

export const triggerDataSyncAction = async (
	target: SyncTarget = "all",
): Promise<SyncRunResult | { error: string; status: string } | null> => {
	const response = await authFetch(`${BACKEND_URL}/data-sync/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ target }),
	});
	if (response.status === 409) return response.json();
	if (!response.ok) return null;
	return response.json();
};

export const retryDataSyncAction = async (
	target: SyncTarget = "all",
): Promise<SyncRunResult | { error: string } | null> => {
	const response = await authFetch(`${BACKEND_URL}/data-sync/retry`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ target }),
	});
	if (response.status === 409) return response.json();
	if (!response.ok) return null;
	return response.json();
};

export const cancelJobAction = async (jobId: string): Promise<{ ok: boolean; message: string } | null> => {
	const response = await authFetch(`${BACKEND_URL}/data-sync/cancel/${jobId}`, {
		method: "POST",
	});
	if (!response.ok) return null;
	return response.json();
};

