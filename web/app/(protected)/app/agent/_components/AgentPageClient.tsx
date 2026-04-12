"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
	AlertTriangle,
	BookOpen,
	ExternalLink,
	GraduationCap,
	Loader2,
	MessageCircle,
	RefreshCw,
	Send,
	ShieldCheck,
	Sparkles,
	Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/FadeIn";
import type { ChatApiResponse, ChatReply } from "@/types/auth.type";

// ── Types ──────────────────────────────────────────────────────────────────────

type UserMessage = { id: string; role: "user"; text: string };
type AssistantMessage = {
	id: string;
	role: "assistant";
	reply: ChatReply;
	isIntro?: boolean;
	isError?: boolean;
};
type ChatMessage = UserMessage | AssistantMessage;

// ── Suggested prompt groups ────────────────────────────────────────────────────

const PROMPT_GROUPS = [
	{
		icon: BookOpen,
		label: "Programs",
		prompts: [
			"Compare my saved programs",
			"Which of my programs has the earliest deadline?",
			"Explain the requirements for my top program",
		],
	},
	{
		icon: Target,
		label: "Scholarships",
		prompts: [
			"What scholarships match my profile?",
			"How do I improve my scholarship chances?",
			"Explain the Chevening scholarship",
		],
	},
	{
		icon: GraduationCap,
		label: "Strategy",
		prompts: [
			"What is my admission chance?",
			"Should I apply to the US or UK?",
			"What documents do I need for a student visa?",
		],
	},
	{
		icon: MessageCircle,
		label: "General",
		prompts: [
			"Give me a timeline for Fall 2026",
			"How do I write a strong SOP?",
			"What's the difference between IELTS and TOEFL?",
		],
	},
];

const INTRO_REPLY: ChatReply = {
	answer:
		"I'm your EducAI AI Assistant. I have access to your saved programmes, profile data, scholarship information, and visa/deadline context. Ask me anything about your application journey — from comparing universities to writing your SOP.",
	bullets: [
		"Profile-aware guidance based on your GPA, test scores, and budget",
		"Programme comparison across your saved shortlist",
		"Scholarship eligibility and deadline alerts",
		"Visa timelines and country-specific requirements",
	],
	nextSteps: [],
	sources: [],
	confidence: "high",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildHistory(messages: ChatMessage[]) {
	return messages
		.filter((m): m is Exclude<ChatMessage, { isIntro?: true }> => {
			if (m.role === "assistant") return !m.isIntro;
			return true;
		})
		.slice(-8)
		.map((m) =>
			m.role === "user"
				? { role: "user" as const, content: m.text }
				: { role: "assistant" as const, content: m.reply.answer },
		);
}

function buildErrorReply(message: string): ChatReply {
	return { answer: message, bullets: [], nextSteps: [], sources: [], confidence: "low" };
}

function normalizeReply(payload: unknown): ChatReply | null {
	if (!payload || typeof payload !== "object") return null;
	const reply = payload as Partial<ChatReply>;
	if (typeof reply.answer !== "string" || !reply.answer.trim()) return null;
	const normalizeList = (v: unknown) =>
		Array.isArray(v)
			? v.filter((i): i is string => typeof i === "string" && i.trim().length > 0)
			: [];
	const sources = Array.isArray(reply.sources)
		? reply.sources.filter(
				(s): s is NonNullable<ChatReply["sources"]>[number] =>
					Boolean(s && typeof s === "object" && (s.type === "internal" || s.type === "web")),
		  )
		: [];
	return {
		answer: reply.answer.trim(),
		bullets: normalizeList(reply.bullets),
		nextSteps: normalizeList(reply.nextSteps),
		sources,
		confidence:
			reply.confidence === "high" || reply.confidence === "medium" || reply.confidence === "low"
				? reply.confidence
				: "medium",
	};
}

function confidencePill(confidence: ChatReply["confidence"]) {
	const cls =
		confidence === "high"
			? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
			: confidence === "low"
			? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
			: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}
		>
			<ShieldCheck className="size-3" />
			{confidence} confidence
		</span>
	);
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: AssistantMessage }) {
	return (
		<div className="flex justify-start">
			<div className="flex gap-3 max-w-[88%]">
				<div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
					<Sparkles className="size-3.5 text-primary" />
				</div>
				<div
					className={`rounded-2xl rounded-tl-sm border px-4 py-3 text-sm ${
						message.isError
							? "border-destructive/20 bg-destructive/5 text-destructive"
							: "border-border bg-card text-foreground"
					}`}
				>
					<div className="space-y-3">
						<p className="leading-relaxed">{message.reply.answer}</p>

						{message.reply.bullets.length > 0 && (
							<ul className="space-y-1.5">
								{message.reply.bullets.map((b) => (
									<li key={b} className="flex items-start gap-2 text-sm">
										<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
										{b}
									</li>
								))}
							</ul>
						)}

						{message.reply.nextSteps.length > 0 && (
							<div className="rounded-xl border border-border bg-muted/40 p-3">
								<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
									Next Steps
								</p>
								<ol className="space-y-1.5">
									{message.reply.nextSteps.map((step, i) => (
										<li key={step} className="flex gap-2 text-sm">
											<span className="text-primary font-medium shrink-0">{i + 1}.</span>
											{step}
										</li>
									))}
								</ol>
							</div>
						)}

						{!message.isIntro && !message.isError && (
							<div className="flex flex-wrap items-center gap-2 text-xs">
								{confidencePill(message.reply.confidence)}
							</div>
						)}

						{message.reply.sources.length > 0 && (
							<div className="rounded-xl border border-border bg-muted/40 p-3">
								<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
									Sources
								</p>
								<div className="space-y-1.5">
									{message.reply.sources.map((source) => (
										<div
											key={`${source.type}-${source.id ?? source.url ?? source.title}`}
											className="flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs"
										>
											<span className="mt-0.5 shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
												{source.type}
											</span>
											{source.type === "web" && source.url ? (
												<a
													href={source.url}
													target="_blank"
													rel="noreferrer"
													className="flex items-center gap-1 text-primary hover:underline"
												>
													{source.title} <ExternalLink className="size-3" />
												</a>
											) : (
												<span className="text-foreground">{source.title}</span>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// ── Main Component ─────────────────────────────────────────────────────────────

export interface AgentPageClientProps {
	profileName: string | null;
	targetCountries: string[] | null;
	savedProgramCount: number;
}

export default function AgentPageClient({
	profileName,
	targetCountries,
	savedProgramCount,
}: AgentPageClientProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ id: "intro", role: "assistant", reply: INTRO_REPLY, isIntro: true },
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const conversationIdRef = useRef("");

	const hasRealMessages = useMemo(
		() => messages.some((m) => m.role === "user"),
		[messages],
	);

	useEffect(() => {
		if (!conversationIdRef.current) {
			conversationIdRef.current =
				globalThis.crypto?.randomUUID?.() ?? `agent-${Date.now()}`;
		}
	}, []);

	useEffect(() => {
		const c = scrollRef.current;
		if (c) c.scrollTop = c.scrollHeight;
	}, [messages, isLoading]);

	const submitPrompt = async (prompt: string) => {
		const trimmed = prompt.trim();
		if (!trimmed || isLoading) return;

		const convId =
			conversationIdRef.current || (globalThis.crypto?.randomUUID?.() ?? `agent-${Date.now()}`);
		conversationIdRef.current = convId;

		const userMsg: UserMessage = {
			id: `${convId}-user-${Date.now()}`,
			role: "user",
			text: trimmed,
		};
		const next = [...messages, userMsg];
		setMessages(next);
		setInput("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: trimmed, conversationId: convId, history: buildHistory(messages) }),
			});

			const payload = (await res.json().catch(() => null)) as ChatApiResponse | { message?: string } | null;

			if (!res.ok) {
				let msg =
					payload && "message" in payload && typeof payload.message === "string"
						? payload.message
						: "The assistant is temporarily unavailable.";
				if (res.status === 401) msg = "Session expired. Please sign in again.";
				else if (res.status === 429) msg = "Rate limit reached. Try again in a moment.";
				else if (res.status >= 500) msg = "The assistant encountered an error. Please try again.";
				setMessages((cur) => [
					...cur,
					{ id: `${convId}-err-${Date.now()}`, role: "assistant", reply: buildErrorReply(msg), isError: true },
				]);
				return;
			}

			const reply = normalizeReply(payload && "reply" in payload ? payload.reply : null);
			if (!reply) throw new Error("Invalid response");

			setMessages((cur) => [
				...cur,
				{ id: `${convId}-ai-${Date.now()}`, role: "assistant", reply },
			]);
		} catch {
			setMessages((cur) => [
				...cur,
				{
					id: `${convId}-fail-${Date.now()}`,
					role: "assistant",
					reply: buildErrorReply("Something went wrong. Please try again."),
					isError: true,
				},
			]);
		} finally {
			setIsLoading(false);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		await submitPrompt(input);
	};

	const handleClear = () => {
		setMessages([{ id: "intro", role: "assistant", reply: INTRO_REPLY, isIntro: true }]);
		conversationIdRef.current = globalThis.crypto?.randomUUID?.() ?? `agent-${Date.now()}`;
		setTimeout(() => inputRef.current?.focus(), 50);
	};

	return (
		<div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
			{/* Sidebar — hidden on mobile, toggle-controlled on desktop */}
			<aside
				className={`flex-shrink-0 border-r border-border bg-card transition-all duration-300 overflow-hidden ${
					sidebarOpen ? "w-72" : "w-0"
				}`}
			>
				<div className="flex h-full w-72 flex-col overflow-y-auto p-4">
					{/* Profile context */}
					<div className="mb-4 rounded-xl border border-border bg-background/60 p-3">
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Your Context
						</p>
						<ul className="space-y-1 text-xs text-muted-foreground">
							{profileName && <li className="flex gap-1.5"><span>🎓</span>{profileName}</li>}
							{targetCountries && targetCountries.length > 0 && (
								<li className="flex gap-1.5">
									<span>🌍</span>
									{targetCountries.slice(0, 3).join(", ")}
									{targetCountries.length > 3 && " +more"}
								</li>
							)}
							<li className="flex gap-1.5">
								<span>📚</span>
								{savedProgramCount} saved programme{savedProgramCount !== 1 ? "s" : ""}
							</li>
						</ul>
					</div>

					{/* Suggested prompts */}
					<div className="flex-1 space-y-4">
						{PROMPT_GROUPS.map(({ icon: Icon, label, prompts }) => (
							<div key={label}>
								<p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									<Icon className="size-3" /> {label}
								</p>
								<ul className="space-y-1">
									{prompts.map((p) => (
										<li key={p}>
											<button
												type="button"
												onClick={() => void submitPrompt(p)}
												className="w-full rounded-lg border border-transparent px-2.5 py-2 text-left text-xs text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground transition-colors"
											>
												{p}
											</button>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					{/* Disclaimer */}
					<div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
						<p className="flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-400">
							<AlertTriangle className="mt-0.5 size-3 shrink-0" />
							Advice-only. Verify critical details with official sources.
						</p>
					</div>
				</div>
			</aside>

			{/* Main chat area */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Toolbar */}
				<div className="flex items-center justify-between border-b border-border bg-background px-4 py-2.5">
					<div className="flex items-center gap-3">
						<button
							onClick={() => setSidebarOpen((v) => !v)}
							className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
							aria-label="Toggle sidebar"
						>
							<MessageCircle className="size-4" />
						</button>
						<div className="flex items-center gap-2">
							<div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
								<Sparkles className="size-3.5 text-primary" />
							</div>
							<div>
								<p className="text-sm font-semibold">EducAI Assistant</p>
								<p className="text-[11px] text-muted-foreground">
									Profile-aware · Citations included
								</p>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{hasRealMessages && (
							<Button
								variant="ghost"
								size="sm"
								className="gap-1.5 text-muted-foreground"
								onClick={handleClear}
							>
								<RefreshCw className="size-3.5" />
								New chat
							</Button>
						)}
					</div>
				</div>

				{/* Messages */}
				<div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 md:px-6">
					{messages.map((message) =>
						message.role === "user" ? (
							<div key={message.id} className="flex justify-end">
								<div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
									{message.text}
								</div>
							</div>
						) : (
							<FadeIn key={message.id}>
								<MessageBubble message={message} />
							</FadeIn>
						),
					)}

					{isLoading && (
						<div className="flex justify-start">
							<div className="flex gap-3 items-center">
								<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
									<Sparkles className="size-3.5 text-primary" />
								</div>
								<div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Loader2 className="size-4 animate-spin text-primary" />
										Thinking through your context…
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Empty state with quick starts */}
					{!hasRealMessages && messages.length === 1 && (
						<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
							{[
								"Compare my saved programs",
								"What scholarships match me?",
								"Visa timeline for my top country",
								"How do I strengthen my application?",
							].map((p) => (
								<button
									key={p}
									type="button"
									onClick={() => void submitPrompt(p)}
									className="rounded-xl border border-border bg-card p-3 text-left text-xs text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground transition-all duration-150"
								>
									{p}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Input area */}
				<form
					onSubmit={handleSubmit}
					className="border-t border-border bg-background px-4 py-3 md:px-6"
				>
					<div className="flex gap-2 items-end">
						<div className="flex-1 relative">
							<Input
								ref={inputRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										void handleSubmit(e as unknown as FormEvent);
									}
								}}
								placeholder="Ask about your programmes, scholarships, visa, or SOP..."
								className="pr-12 py-3 text-sm"
								disabled={isLoading}
								autoFocus
							/>
							<Button
								type="submit"
								size="icon"
								disabled={isLoading || !input.trim()}
								className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8 rounded-lg"
								aria-label="Send"
							>
								{isLoading ? (
									<Loader2 className="size-3.5 animate-spin" />
								) : (
									<Send className="size-3.5" />
								)}
							</Button>
						</div>
					</div>
					<p className="mt-1.5 text-[11px] text-muted-foreground text-center">
						Advice-only · Always verify with official sources
					</p>
				</form>
			</div>
		</div>
	);
}
