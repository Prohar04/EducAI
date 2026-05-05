"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
	AlertTriangle,
	ExternalLink,
	Loader2,
	MessageCircle,
	Send,
	ShieldCheck,
	Sparkles,
	X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { variants, ease } from "@/lib/motion";
import type { ChatApiResponse, ChatReply } from "@/types/auth.type";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserMessage    = { id: string; role: "user"; text: string };
type AssistantMessage = { id: string; role: "assistant"; reply: ChatReply; isIntro?: boolean; isError?: boolean };
type ChatMessage    = UserMessage | AssistantMessage;

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
	"Compare my saved programs",
	"What visa do I need for my target country?",
	"Scholarships that match my profile",
	"Deadlines I should focus on this month",
	"Which program fits my budget?",
	"How do I strengthen my application?",
];

const INTRO_REPLY: ChatReply = {
	answer:
		"Hi! I'm your EducAI admissions consultant. Ask me about your saved programs, visa requirements, scholarships, application strategy, or anything else about studying abroad.",
	bullets: [],
	nextSteps: [],
	sources: [],
	confidence: "medium",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildHistory(messages: ChatMessage[]) {
	return messages
		.filter((m): m is Exclude<ChatMessage, { isIntro?: true }> =>
			m.role === "assistant" ? !m.isIntro : true,
		)
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
				(i): i is NonNullable<ChatReply["sources"]>[number] =>
					Boolean(i && typeof i === "object" && (i.type === "internal" || i.type === "web") && typeof i.title === "string"),
			)
		: [];

	return {
		answer:     reply.answer.trim(),
		bullets:    normalizeList(reply.bullets),
		nextSteps:  normalizeList(reply.nextSteps),
		sources,
		confidence: reply.confidence === "high" || reply.confidence === "medium" || reply.confidence === "low"
			? reply.confidence
			: "medium",
	};
}

function confidenceBadge(c: ChatReply["confidence"]) {
	if (c === "high")   return "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
	if (c === "low")    return "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400";
	return "border-border bg-muted/60 text-muted-foreground";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatbotWidget() {
	const reduced = useReducedMotion();
	const [open, setOpen] = useState(() => {
		if (typeof window === "undefined") return false;
		return sessionStorage.getItem("chatbot:open") === "true";
	});
	const [input,     setInput]     = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [messages,  setMessages]  = useState<ChatMessage[]>([
		{ id: "intro", role: "assistant", reply: INTRO_REPLY, isIntro: true },
	]);

	const scrollRef        = useRef<HTMLDivElement | null>(null);
	const inputRef         = useRef<HTMLInputElement | null>(null);
	const conversationId   = useRef("");

	const hasRealMessages = useMemo(
		() => messages.some((m) => m.role === "user"),
		[messages],
	);

	// Stable conversation ID
	useEffect(() => {
		if (!conversationId.current) {
			conversationId.current = globalThis.crypto?.randomUUID?.() ?? `chat-${Date.now()}`;
		}
	}, []);

	// Auto-scroll on new messages
	useEffect(() => {
		const el = scrollRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [messages, isLoading]);

	// Focus input when panel opens
	useEffect(() => {
		if (open) setTimeout(() => inputRef.current?.focus(), 120);
	}, [open]);

	// ── Submit ──────────────────────────────────────────────────────────────────
	const submitPrompt = async (prompt: string) => {
		const trimmed = prompt.trim();
		if (!trimmed || isLoading) return;

		const cid = conversationId.current || `chat-${Date.now()}`;
		conversationId.current = cid;

		const userMsg: UserMessage = { id: `${cid}-u-${Date.now()}`, role: "user", text: trimmed };
		const nextMessages = [...messages, userMsg];
		setMessages(nextMessages);
		setInput("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/chat", {
				method:  "POST",
				headers: { "Content-Type": "application/json" },
				body:    JSON.stringify({ message: trimmed, conversationId: cid, history: buildHistory(messages) }),
			});

			const payload = await response.json().catch(() => null) as ChatApiResponse | { message?: string } | null;

			if (!response.ok) {
				let errorMessage =
					payload && "message" in payload && typeof payload.message === "string"
						? payload.message
						: "Something went wrong. Please try again.";

				if      (response.status === 401) errorMessage = "Session expired. Please sign in again.";
				else if (response.status === 429) errorMessage = "The assistant is temporarily busy. Please wait a moment and try again.";
				else if (response.status >= 500)  errorMessage = "The assistant encountered an error. Please try again in a moment.";

				setMessages((cur) => [...cur, {
					id: `${cid}-err-${Date.now()}`,
					role: "assistant",
					reply: buildErrorReply(errorMessage),
					isError: true,
				}]);
				return;
			}

			const reply = normalizeReply(payload && "reply" in payload ? payload.reply : null);
			if (!reply) throw new Error("Invalid response shape");

			setMessages((cur) => [...cur, { id: `${cid}-a-${Date.now()}`, role: "assistant", reply }]);

		} catch (err) {
			const msg = err instanceof Error ? err.message : null;
			if (msg?.includes("NEXT_REDIRECT")) return;
			setMessages((cur) => [...cur, {
				id: `${cid}-fail-${Date.now()}`,
				role: "assistant",
				reply: buildErrorReply("Could not reach the assistant. Check your connection and try again."),
				isError: true,
			}]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); void submitPrompt(input); };
	const toggleOpen   = () => setOpen((v) => { const next = !v; sessionStorage.setItem("chatbot:open", String(next)); return next; });

	// ── Render ──────────────────────────────────────────────────────────────────
	return (
		<div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

			{/* ── Chat panel ── */}
			<AnimatePresence>
			{open && (
				<motion.div
					key="chat-panel"
					variants={reduced ? undefined : variants.panelOpen}
					initial="hidden"
					animate="visible"
					exit="exit"
					className="flex w-[min(388px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
					style={{ height: "min(580px, calc(100vh - 7rem))" }}
				>
					{/* Header */}
					<div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3.5">
						<div className="flex items-center gap-2.5">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/15">
								<Sparkles className="size-4 text-primary" />
							</div>
							<div>
								<p className="text-sm font-semibold leading-none text-foreground">EducAI Assistant</p>
								<p className="mt-0.5 text-xs text-muted-foreground">Personalised study-abroad guidance</p>
							</div>
						</div>
						<button
							onClick={toggleOpen}
							aria-label="Close chat"
							className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
						>
							<X className="size-4" />
						</button>
					</div>

					{/* Messages */}
					<div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">

						{/* Suggested prompts (only before first message) */}
						{!hasRealMessages && (
							<div className="rounded-xl border border-border bg-card p-3">
								<p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
									Suggested questions
								</p>
								<div className="flex flex-wrap gap-1.5">
									{SUGGESTED_PROMPTS.map((p) => (
										<button
											key={p}
											type="button"
											onClick={() => void submitPrompt(p)}
											className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-left text-xs text-foreground transition hover:border-primary/50 hover:bg-primary/15"
										>
											{p}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Message list */}
						{messages.map((m) =>
							m.role === "user" ? (
								/* User bubble */
								<motion.div
									key={m.id}
									variants={reduced ? undefined : variants.messageBubble}
									initial="hidden"
									animate="visible"
									className="flex justify-end"
								>
									<div className="max-w-[86%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm">
										{m.text}
									</div>
								</motion.div>
							) : (
								/* Assistant bubble */
								<motion.div
									key={m.id}
									variants={reduced ? undefined : variants.messageBubble}
									initial="hidden"
									animate="visible"
									className="flex justify-start"
								>
									<div
										className={`max-w-[92%] rounded-2xl rounded-bl-sm border px-4 py-3 text-sm ${
											m.isError
												? "border-destructive/25 bg-destructive/8 text-foreground"
												: "border-border bg-card text-foreground"
										}`}
									>
										{/* Error icon */}
										{m.isError && (
											<div className="mb-2 flex items-center gap-1.5 text-xs text-destructive">
												<AlertTriangle className="size-3.5 shrink-0" />
												<span className="font-medium">Assistant error</span>
											</div>
										)}

										{/* Main answer */}
										<p className="leading-relaxed">{m.reply.answer}</p>

										{/* Bullets */}
										{m.reply.bullets.length > 0 && (
											<ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
												{m.reply.bullets.map((b) => (
													<li key={b} className="flex gap-2">
														<span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/70" />
														<span>{b}</span>
													</li>
												))}
											</ul>
										)}

										{/* Next steps */}
										{m.reply.nextSteps.length > 0 && (
											<div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
												<p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
													Next steps
												</p>
												<ol className="space-y-1.5 text-sm text-foreground">
													{m.reply.nextSteps.map((step, i) => (
														<li key={step} className="flex gap-2">
															<span className="shrink-0 font-semibold text-primary">{i + 1}.</span>
															<span>{step}</span>
														</li>
													))}
												</ol>
											</div>
										)}

										{/* Confidence + Sources row */}
										{!m.isIntro && (
											<div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
												<span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${confidenceBadge(m.reply.confidence)}`}>
													<ShieldCheck className="size-2.5" />
													{m.reply.confidence} confidence
												</span>
											</div>
										)}

										{/* Sources */}
										{m.reply.sources.length > 0 && (
											<div className="mt-3 space-y-1.5">
												<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
													Sources
												</p>
												{m.reply.sources.map((src) => (
													<div
														key={`${src.type}-${src.id ?? src.url ?? src.title}`}
														className="rounded-lg border border-border bg-muted/30 px-3 py-2"
													>
														<p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
															{src.type}{src.id ? ` · ${src.id}` : ""}
														</p>
														{src.type === "web" && src.url ? (
															<a
																href={src.url}
																target="_blank"
																rel="noreferrer"
																className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:opacity-80"
															>
																{src.title}
																<ExternalLink className="size-3" />
															</a>
														) : (
															<p className="text-xs text-foreground">{src.title}</p>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								</motion.div>
							),
						)}

						{/* Loading indicator */}
						{isLoading && (
							<motion.div
								key="loading"
								variants={reduced ? undefined : variants.messageBubble}
								initial="hidden"
								animate="visible"
								className="flex justify-start"
							>
								<div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
									<span className="flex gap-1">
										{[0, 100, 200].map((delay) => (
											<span
												key={delay}
												className="size-1.5 rounded-full bg-primary animate-bounce"
												style={{ animationDelay: `${delay}ms` }}
											/>
										))}
									</span>
									Thinking…
								</div>
							</motion.div>
						)}
					</div>

					{/* Input */}
					<form
						onSubmit={handleSubmit}
						className="border-t border-border bg-card px-4 py-3"
					>
						<div className="flex gap-2">
							<Input
								ref={inputRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Ask about visas, programs, scholarships…"
								className="h-10 flex-1 text-sm"
								disabled={isLoading}
								autoComplete="off"
							/>
							<Button
								type="submit"
								size="icon"
								className="size-10 shrink-0 rounded-xl"
								disabled={isLoading || input.trim().length === 0}
								aria-label="Send message"
							>
								{isLoading
									? <Loader2 className="size-4 animate-spin" />
									: <Send className="size-4" />
								}
							</Button>
						</div>
						<p className="mt-2 text-center text-[10px] text-muted-foreground/60">
							Advice only · Not a substitute for official guidance
						</p>
					</form>
				</motion.div>
			)}
			</AnimatePresence>

			{/* ── Toggle button ── */}
			<motion.div
				whileHover={reduced ? undefined : { scale: 1.06 }}
				whileTap={reduced ? undefined : { scale: 0.94 }}
				transition={{ duration: 0.14, ease: ease.spring }}
			>
				<Button
					size="icon"
					variant={open ? "outline" : "default"}
					className="size-13 rounded-full shadow-lg"
					onClick={toggleOpen}
					aria-label={open ? "Close chat" : "Open AI assistant"}
				>
					<AnimatePresence mode="wait">
						{open ? (
							<motion.span key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.14 }}>
								<X className="size-5" />
							</motion.span>
						) : (
							<motion.span key="open" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.14 }}>
								<MessageCircle className="size-5" />
							</motion.span>
						)}
					</AnimatePresence>
				</Button>
			</motion.div>
		</div>
	);
}
