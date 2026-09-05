"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Bold,
	Italic,
	Underline,
	Heading,
	List,
	ListOrdered,
	AlignLeft,
	AlignCenter,
	AlignJustify,
	Undo2,
	Redo2,
	RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Strip a leading/trailing ```html fence or stray markdown code fences. */
function stripCodeFences(html: string): string {
	return html
		.replace(/^\s*```(?:html)?\s*/i, "")
		.replace(/\s*```\s*$/i, "")
		.trim();
}

/** True when the string already contains block-level HTML we can render as-is. */
export function looksLikeHtml(value: string): boolean {
	return /<\/?(p|div|h[1-6]|ul|ol|li|br|strong|em|blockquote)\b[^>]*>/i.test(value);
}

/** Convert a plain-text draft into a minimal HTML fragment (blank line = new paragraph). */
export function textToHtml(text: string): string {
	const blocks = text
		.split(/\n{2,}/)
		.map((b) => b.trim())
		.filter(Boolean);
	if (blocks.length === 0) return "";
	return blocks
		.map((b) => `<p>${b.replace(/\n/g, "<br>").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
		.join("");
}

/** Best-effort plain-text extraction from an HTML fragment (for copy / .txt / word count). */
export function htmlToText(html: string): string {
	if (typeof document === "undefined") {
		return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
	}
	const el = document.createElement("div");
	el.innerHTML = html;
	el.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, li, br").forEach((node) => {
		node.append("\n");
	});
	return (el.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

export function countWords(html: string): number {
	const text = htmlToText(html).trim();
	return text ? text.split(/\s+/).length : 0;
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

type Cmd =
	| { kind: "cmd"; command: string; value?: string; icon: React.ReactNode; label: string }
	| { kind: "sep" };

const TOOLBAR: Cmd[] = [
	{ kind: "cmd", command: "bold", icon: <Bold className="h-3.5 w-3.5" />, label: "Bold" },
	{ kind: "cmd", command: "italic", icon: <Italic className="h-3.5 w-3.5" />, label: "Italic" },
	{ kind: "cmd", command: "underline", icon: <Underline className="h-3.5 w-3.5" />, label: "Underline" },
	{ kind: "sep" },
	{ kind: "cmd", command: "formatBlock", value: "h3", icon: <Heading className="h-3.5 w-3.5" />, label: "Heading" },
	{ kind: "cmd", command: "insertUnorderedList", icon: <List className="h-3.5 w-3.5" />, label: "Bullet list" },
	{ kind: "cmd", command: "insertOrderedList", icon: <ListOrdered className="h-3.5 w-3.5" />, label: "Numbered list" },
	{ kind: "sep" },
	{ kind: "cmd", command: "justifyLeft", icon: <AlignLeft className="h-3.5 w-3.5" />, label: "Align left" },
	{ kind: "cmd", command: "justifyCenter", icon: <AlignCenter className="h-3.5 w-3.5" />, label: "Align centre" },
	{ kind: "cmd", command: "justifyFull", icon: <AlignJustify className="h-3.5 w-3.5" />, label: "Justify" },
	{ kind: "sep" },
	{ kind: "cmd", command: "undo", icon: <Undo2 className="h-3.5 w-3.5" />, label: "Undo" },
	{ kind: "cmd", command: "redo", icon: <Redo2 className="h-3.5 w-3.5" />, label: "Redo" },
	{ kind: "cmd", command: "removeFormat", icon: <RemoveFormatting className="h-3.5 w-3.5" />, label: "Clear formatting" },
];

// ── Component ────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
	/** HTML fragment (or plain text — it will be converted). */
	value: string;
	onChange: (html: string) => void;
	placeholder?: string;
	className?: string;
	/** Serif font + justified prose, matching the SOP paper preview. */
	fontFamily?: string;
	minHeight?: number | string;
}

export default function RichTextEditor({
	value,
	onChange,
	placeholder = "Start writing…",
	className,
	fontFamily = "'Georgia', 'Times New Roman', serif",
	minHeight = 420,
}: RichTextEditorProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [focused, setFocused] = useState(false);
	// Track the HTML we last pushed to the DOM so we don't clobber the caret on
	// every keystroke-driven re-render.
	const lastHtml = useRef<string>("");

	const normalised = looksLikeHtml(value) ? stripCodeFences(value) : textToHtml(value);

	// Sync external value → DOM, but never while the user is actively editing.
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (focused) return;
		if (normalised === lastHtml.current) return;
		el.innerHTML = normalised;
		lastHtml.current = normalised;
	}, [normalised, focused]);

	const emit = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		const html = el.innerHTML;
		lastHtml.current = html;
		onChange(html);
	}, [onChange]);

	const run = useCallback(
		(command: string, val?: string) => {
			const el = ref.current;
			if (!el) return;
			el.focus();
			// formatBlock toggles back to <p> when the block is already that tag.
			if (command === "formatBlock" && val) {
				const sel = window.getSelection();
				const anchor = sel?.anchorNode;
				const block = anchor
					? (anchor.nodeType === 1 ? (anchor as HTMLElement) : anchor.parentElement)?.closest("h1,h2,h3,h4,h5,h6,p")
					: null;
				const next = block && block.tagName.toLowerCase() === val ? "p" : val;
				document.execCommand("formatBlock", false, next);
			} else {
				document.execCommand(command, false, val);
			}
			emit();
		},
		[emit],
	);

	const onPaste = useCallback(
		(e: React.ClipboardEvent<HTMLDivElement>) => {
			// Paste as plain text so external styling never leaks in.
			e.preventDefault();
			const text = e.clipboardData.getData("text/plain");
			document.execCommand("insertText", false, text);
			emit();
		},
		[emit],
	);

	const isEmpty = htmlToText(normalised).length === 0;

	return (
		<div className={cn("rounded-lg border border-border bg-card", className)}>
			<div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
				{TOOLBAR.map((item, i) =>
					item.kind === "sep" ? (
						<span key={i} className="mx-1 h-5 w-px bg-border" />
					) : (
						<button
							key={i}
							type="button"
							title={item.label}
							aria-label={item.label}
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => run(item.command, item.value)}
							className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
						>
							{item.icon}
						</button>
					),
				)}
			</div>

			<div className="relative">
				{isEmpty && (
					<span className="pointer-events-none absolute left-6 top-5 text-sm text-muted-foreground">{placeholder}</span>
				)}
				<div
					ref={ref}
					contentEditable
					suppressContentEditableWarning
					spellCheck
					onInput={emit}
					onBlur={() => {
						setFocused(false);
						emit();
					}}
					onFocus={() => setFocused(true)}
					onPaste={onPaste}
					className="rte-surface max-w-none overflow-y-auto px-6 py-5 text-[0.95rem] leading-8 text-[#1e293b] focus:outline-none"
					style={{ fontFamily, minHeight, maxHeight: "62vh" }}
				/>
			</div>

			<style jsx global>{`
				.rte-surface p {
					margin: 0 0 1rem;
					text-align: justify;
				}
				.rte-surface h3 {
					margin: 1.4rem 0 0.6rem;
					font-size: 1.05rem;
					font-weight: 700;
					color: #1a2744;
				}
				.rte-surface ul,
				.rte-surface ol {
					margin: 0 0 1rem 1.4rem;
				}
				.rte-surface li {
					margin-bottom: 0.35rem;
				}
				.rte-surface:focus p:first-child {
					text-indent: 0;
				}
			`}</style>
		</div>
	);
}
