"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
	ExternalLink,
	Loader2,
	MessageCircle,
	Send,
	ShieldCheck,
	Sparkles,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatApiResponse, ChatReply } from "@/types/auth.type";

type UserMessage = {
	id: string;
	role: "user";
	text: string;
};

type AssistantMessage = {
	id: string;
	role: "assistant";
	reply: ChatReply;
	isIntro?: boolean;
	isError?: boolean;
};

type ChatMessage = UserMessage | AssistantMessage;

const SUGGESTED_PROMPTS = [
	"Compare my saved programs",
	"What deadlines should I focus on?",
	"Visa timeline for my target country",
	"Scholarships for my profile",
];

const INTRO_REPLY: ChatReply = {
	answer:
		"Ask about your saved programs, deadlines, visa timing, or scholarships and I’ll keep the guidance advice-only with citations.",
	bullets: [],
	nextSteps: [],
	sources: [],
	confidence: "medium",
};

function buildHistory(messages: ChatMessage[]) {
	return messages
		.filter((message): message is Exclude<ChatMessage, { isIntro?: true }> => {
			if (message.role === "assistant") return !message.isIntro;
			return true;
		})
		.slice(-6)
		.map((message) =>
			message.role === "user"
				? { role: "user" as const, content: message.text }
				: { role: "assistant" as const, content: message.reply.answer },
		);
}

function buildErrorReply(message: string): ChatReply {
	return {
		answer: message,
		bullets: [],
		nextSteps: [],
		sources: [],
		confidence: "low",
	};
}

function normalizeReply(payload: unknown): ChatReply | null {
	if (!payload || typeof payload !== "object") return null;

	const reply = payload as Partial<ChatReply>;
	if (typeof reply.answer !== "string" || !reply.answer.trim()) return null;

	const normalizeList = (value: unknown) =>
		Array.isArray(value)
			? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
			: [];
	const sources = Array.isArray(reply.sources)
		? reply.sources.filter(
				(item): item is NonNullable<ChatReply["sources"]>[number] =>
					Boolean(
						item &&
							typeof item === "object" &&
							(item.type === "internal" || item.type === "web") &&
							typeof item.title === "string",
					),
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

function confidenceClasses(confidence: ChatReply["confidence"]) {
	if (confidence === "high") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
	if (confidence === "low") return "border-amber-500/30 bg-amber-500/10 text-amber-100";
	return "border-sky-500/30 bg-sky-500/10 text-sky-100";
}

export function ChatbotWidget() {
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: "intro",
			role: "assistant",
			reply: INTRO_REPLY,
			isIntro: true,
		},
	]);

	const scrollRef = useRef<HTMLDivElement | null>(null);
	const conversationIdRef = useRef("");

	const hasRealConversation = useMemo(
		() => messages.some((message) => message.role === "user"),
		[messages],
	);

	useEffect(() => {
		if (!conversationIdRef.current) {
			conversationIdRef.current =
				globalThis.crypto?.randomUUID?.() ?? `chat-${Date.now()}`;
		}
	}, []);

	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;
		container.scrollTop = container.scrollHeight;
	}, [messages, isLoading]);

	const submitPrompt = async (prompt: string) => {
		const trimmed = prompt.trim();
		if (!trimmed || isLoading) return;

		const conversationId =
			conversationIdRef.current ||
			(globalThis.crypto?.randomUUID?.() ?? `chat-${Date.now()}`);
		conversationIdRef.current = conversationId;

		const userMessage: UserMessage = {
			id: `${conversationId}-user-${Date.now()}`,
			role: "user",
			text: trimmed,
		};

		const nextMessages = [...messages, userMessage];
		setMessages(nextMessages);
		setInput("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: trimmed,
					conversationId,
					history: buildHistory(messages),
				}),
			});

			const payload = (await response.json().catch(() => null)) as ChatApiResponse | { message?: string } | null;

			if (!response.ok) {
				let errorMessage =
					payload && "message" in payload && typeof payload.message === "string"
						? payload.message
						: "The assistant is temporarily unavailable. Please try again shortly.";

				if (response.status === 401) {
					errorMessage = "Session expired. Please sign in again.";
				} else if (response.status === 429) {
					errorMessage = "Rate limit reached. Try again in a minute.";
				} else if (response.status >= 500) {
					errorMessage = "The assistant is temporarily unavailable. Please try again shortly.";
				}

				setMessages((current) => [
					...current,
					{
						id: `${conversationId}-error-${Date.now()}`,
						role: "assistant",
						reply: buildErrorReply(errorMessage),
						isError: true,
					},
				]);
				return;
			}

			const reply = normalizeReply(payload && "reply" in payload ? payload.reply : null);
			if (!reply) {
				throw new Error("Invalid chat response");
			}

			setMessages((current) => [
				...current,
				{
					id: `${conversationId}-assistant-${Date.now()}`,
					role: "assistant",
					reply,
				},
			]);
		} catch (error) {
			console.error("[chat-widget]", error);
			setMessages((current) => [
				...current,
				{
					id: `${conversationId}-failure-${Date.now()}`,
					role: "assistant",
					reply: buildErrorReply(
						"The assistant is temporarily unavailable. Please try again shortly.",
					),
					isError: true,
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await submitPrompt(input);
	};

	return (
		<div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
			{open && (
				<div className="fixed inset-y-4 right-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/96 text-slate-50 shadow-[0_28px_80px_rgba(15,23,42,0.55)] backdrop-blur-xl">
					<div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_50%),linear-gradient(135deg,_rgba(15,23,42,1),_rgba(2,6,23,0.92))] px-5 py-4">
						<div className="flex items-start justify-between gap-3">
							<div>
								<div className="flex items-center gap-2">
									<div className="flex size-9 items-center justify-center rounded-2xl bg-white/10">
										<Sparkles className="size-4 text-cyan-200" />
									</div>
									<div>
										<p className="text-sm font-semibold text-white">EducAI Assistant</p>
										<p className="text-xs text-slate-300">
											Advice-only guidance with internal and web citations
										</p>
									</div>
								</div>
							</div>
							<button
								onClick={() => setOpen(false)}
								aria-label="Close chat"
								className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
							>
								<X className="size-4" />
							</button>
						</div>
					</div>

					<div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-950/70 p-4">
						{!hasRealConversation && (
							<div className="rounded-2xl border border-white/10 bg-white/5 p-3">
								<p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
									Suggested prompts
								</p>
								<div className="flex flex-wrap gap-2">
									{SUGGESTED_PROMPTS.map((prompt) => (
										<button
											key={prompt}
											type="button"
											onClick={() => void submitPrompt(prompt)}
											className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-left text-xs text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
										>
											{prompt}
										</button>
									))}
								</div>
							</div>
						)}

						{messages.map((message) =>
							message.role === "user" ? (
								<div key={message.id} className="flex justify-end">
									<div className="max-w-[88%] rounded-2xl rounded-br-md bg-cyan-400 px-4 py-3 text-sm font-medium text-slate-950">
										{message.text}
									</div>
								</div>
							) : (
								<div key={message.id} className="flex justify-start">
									<div
										className={`max-w-[92%] rounded-3xl rounded-bl-md border px-4 py-3 text-sm ${
											message.isError
												? "border-amber-500/20 bg-amber-500/10 text-amber-50"
												: "border-white/10 bg-white/5 text-slate-100"
										}`}
									>
										<div className="space-y-3">
											<p className="leading-6">{message.reply.answer}</p>

											{message.reply.bullets.length > 0 && (
												<ul className="space-y-1.5 text-slate-200">
													{message.reply.bullets.map((bullet) => (
														<li key={bullet} className="flex gap-2">
															<span className="mt-1 text-cyan-300">•</span>
															<span>{bullet}</span>
														</li>
													))}
												</ul>
											)}

											{message.reply.nextSteps.length > 0 && (
												<div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
													<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
														Next steps
													</p>
													<ol className="space-y-1.5 text-slate-200">
														{message.reply.nextSteps.map((step, index) => (
															<li key={step} className="flex gap-2">
																<span className="text-cyan-300">{index + 1}.</span>
																<span>{step}</span>
															</li>
														))}
													</ol>
												</div>
											)}

											{!message.isIntro && (
												<div className="flex flex-wrap items-center gap-2 text-xs">
													<span
														className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${confidenceClasses(message.reply.confidence)}`}
													>
														<ShieldCheck className="size-3" />
														{message.reply.confidence} confidence
													</span>
												</div>
											)}

											{message.reply.sources.length > 0 && (
												<div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
													<p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
														Sources
													</p>
													<div className="space-y-2">
														{message.reply.sources.map((source) => (
															<div
																key={`${source.type}-${source.id || source.url || source.title}`}
																className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2"
															>
																<div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
																	<span>{source.type}</span>
																	{source.id && <span>{source.id}</span>}
																</div>
																{source.type === "web" && source.url ? (
																	<a
																		href={source.url}
																		target="_blank"
																		rel="noreferrer"
																		className="inline-flex items-center gap-1 text-sm text-cyan-200 transition hover:text-cyan-100"
																	>
																		{source.title}
																		<ExternalLink className="size-3" />
																	</a>
																) : (
																	<p className="text-sm text-slate-100">{source.title}</p>
																)}
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							),
						)}

						{isLoading && (
							<div className="flex justify-start">
								<div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
									<Loader2 className="size-4 animate-spin text-cyan-200" />
									Thinking through your context...
								</div>
							</div>
						)}
					</div>

					<form onSubmit={handleSubmit} className="border-t border-white/10 bg-slate-950 px-4 py-4">
						<div className="flex gap-2">
							<Input
								value={input}
								onChange={(event) => setInput(event.target.value)}
								placeholder="Ask about your saved programs, deadlines, visas, or scholarships..."
								className="h-11 flex-1 border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500"
								disabled={isLoading}
							/>
							<Button
								type="submit"
								size="icon"
								className="size-11 rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"
								disabled={isLoading || input.trim().length === 0}
								aria-label="Send message"
							>
								{isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
							</Button>
						</div>
					</form>
				</div>
			)}

			<Button
				size="icon"
				className="size-14 rounded-full bg-slate-950 text-cyan-200 shadow-[0_18px_40px_rgba(15,23,42,0.4)] hover:bg-slate-900"
				onClick={() => setOpen((value) => !value)}
				aria-label={open ? "Close chat" : "Open chat"}
			>
				{open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
			</Button>
		</div>
	);
}
