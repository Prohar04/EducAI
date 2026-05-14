"use client";

import React, { useMemo } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedLine {
  type: "name" | "contact" | "section" | "bullet" | "sub-bullet" | "text" | "blank";
  content: string;
}

interface TemplateStyle {
  fontFamily: string;
  nameSize: string;
  sectionColor: string;
  sectionBorderColor: string;
  accentColor: string;
  lineHeight: string;
  bodySize: string;
}

// ── Template style map ────────────────────────────────────────────────────────

const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  "minimal-academic": {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    nameSize: "1.5rem",
    sectionColor: "#1a2744",
    sectionBorderColor: "#4A90D9",
    accentColor: "#4A90D9",
    lineHeight: "1.6",
    bodySize: "0.875rem",
  },
  "research-focused": {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    nameSize: "1.4rem",
    sectionColor: "#1a2744",
    sectionBorderColor: "#3D6B9F",
    accentColor: "#3D6B9F",
    lineHeight: "1.7",
    bodySize: "0.875rem",
  },
  "modern-professional": {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    nameSize: "1.6rem",
    sectionColor: "#0f172a",
    sectionBorderColor: "#4A90D9",
    accentColor: "#4A90D9",
    lineHeight: "1.55",
    bodySize: "0.875rem",
  },
  "scholarship-focused": {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    nameSize: "1.45rem",
    sectionColor: "#1e3a5f",
    sectionBorderColor: "#2563EB",
    accentColor: "#2563EB",
    lineHeight: "1.65",
    bodySize: "0.875rem",
  },
  "international-student": {
    fontFamily: "'Inter', Arial, sans-serif",
    nameSize: "1.45rem",
    sectionColor: "#0f172a",
    sectionBorderColor: "#4A90D9",
    accentColor: "#4A90D9",
    lineHeight: "1.6",
    bodySize: "0.875rem",
  },
  "technical-engineering": {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    nameSize: "1.5rem",
    sectionColor: "#0f172a",
    sectionBorderColor: "#64748b",
    accentColor: "#475569",
    lineHeight: "1.5",
    bodySize: "0.8125rem",
  },
  "business-management": {
    fontFamily: "'Inter', Arial, sans-serif",
    nameSize: "1.55rem",
    sectionColor: "#1e3a5f",
    sectionBorderColor: "#2563EB",
    accentColor: "#2563EB",
    lineHeight: "1.6",
    bodySize: "0.875rem",
  },
  "clean-classic": {
    fontFamily: "'Times New Roman', Georgia, serif",
    nameSize: "1.45rem",
    sectionColor: "#111827",
    sectionBorderColor: "#374151",
    accentColor: "#374151",
    lineHeight: "1.6",
    bodySize: "0.875rem",
  },
  "compact-one-page": {
    fontFamily: "'Inter', Arial, sans-serif",
    nameSize: "1.3rem",
    sectionColor: "#0f172a",
    sectionBorderColor: "#4A90D9",
    accentColor: "#4A90D9",
    lineHeight: "1.45",
    bodySize: "0.8125rem",
  },
  "phd-research": {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    nameSize: "1.45rem",
    sectionColor: "#1a2744",
    sectionBorderColor: "#3D6B9F",
    accentColor: "#3D6B9F",
    lineHeight: "1.7",
    bodySize: "0.875rem",
  },
  // SOP templates
  "formal-academic": {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    nameSize: "1.25rem",
    sectionColor: "#1a2744",
    sectionBorderColor: "#4A90D9",
    accentColor: "#4A90D9",
    lineHeight: "1.8",
    bodySize: "1rem",
  },
  "personal-story": {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    nameSize: "1.25rem",
    sectionColor: "#374151",
    sectionBorderColor: "#6B7280",
    accentColor: "#6B7280",
    lineHeight: "1.85",
    bodySize: "1rem",
  },
  "professional-career": {
    fontFamily: "'Inter', Arial, sans-serif",
    nameSize: "1.2rem",
    sectionColor: "#1e3a5f",
    sectionBorderColor: "#2563EB",
    accentColor: "#2563EB",
    lineHeight: "1.7",
    bodySize: "0.9375rem",
  },
  "compact-direct": {
    fontFamily: "'Inter', Arial, sans-serif",
    nameSize: "1.1rem",
    sectionColor: "#0f172a",
    sectionBorderColor: "#374151",
    accentColor: "#374151",
    lineHeight: "1.6",
    bodySize: "0.9375rem",
  },
  "highly-persuasive": {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    nameSize: "1.25rem",
    sectionColor: "#1e3a5f",
    sectionBorderColor: "#4A90D9",
    accentColor: "#4A90D9",
    lineHeight: "1.85",
    bodySize: "1rem",
  },
  "phd-proposal": {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    nameSize: "1.25rem",
    sectionColor: "#1a2744",
    sectionBorderColor: "#3D6B9F",
    accentColor: "#3D6B9F",
    lineHeight: "1.8",
    bodySize: "1rem",
  },
};

const DEFAULT_STYLE: TemplateStyle = {
  fontFamily: "'Inter', Arial, sans-serif",
  nameSize: "1.4rem",
  sectionColor: "#1a2744",
  sectionBorderColor: "#4A90D9",
  accentColor: "#4A90D9",
  lineHeight: "1.65",
  bodySize: "0.875rem",
};

// ── Parsers ───────────────────────────────────────────────────────────────────

function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // All-caps line 3+ chars (e.g. "EDUCATION", "WORK EXPERIENCE")
  if (trimmed.length >= 3 && trimmed === trimmed.toUpperCase() && /^[A-Z\s\/&()-]+$/.test(trimmed)) return true;
  // Line ending with colon and 3–40 chars (e.g. "Education:", "Skills:")
  if (/^[A-Z][A-Za-z\s&\/()-]{2,39}:$/.test(trimmed)) return true;
  // Underlined with === or ---
  return false;
}

function isUnderlineSeparator(line: string): boolean {
  const t = line.trim();
  return /^[=\-]{3,}$/.test(t);
}

function isContactLine(line: string): boolean {
  const t = line.trim();
  // Contains email, phone, pipe-separated info, or URL patterns
  return (
    t.includes("@") ||
    t.includes("|") ||
    /\+?[\d\s()\-]{8,}/.test(t) ||
    t.startsWith("linkedin") ||
    t.startsWith("github") ||
    t.startsWith("http")
  );
}

function parseDocument(content: string): ParsedLine[] {
  const raw = content.split("\n");
  const lines: ParsedLine[] = [];
  let nameFound = false;

  for (let i = 0; i < raw.length; i++) {
    const line = raw[i];
    const trimmed = line.trim();

    if (!trimmed) {
      lines.push({ type: "blank", content: "" });
      continue;
    }

    // Skip underline separators — they're consumed after a section header
    if (isUnderlineSeparator(trimmed)) {
      if (lines.length > 0 && lines[lines.length - 1].type === "section") continue;
      // If follows a name line
      if (lines.length > 0 && lines[lines.length - 1].type === "name") continue;
      continue;
    }

    // First non-blank content: treat as name unless it looks like a contact line
    if (!nameFound && !isContactLine(trimmed) && !isSectionHeader(trimmed)) {
      nameFound = true;
      lines.push({ type: "name", content: trimmed });
      continue;
    }

    if (!nameFound) nameFound = true;

    if (isContactLine(trimmed) && lines.length <= 4) {
      lines.push({ type: "contact", content: trimmed });
      continue;
    }

    if (isSectionHeader(trimmed)) {
      lines.push({ type: "section", content: trimmed.replace(/:$/, "") });
      continue;
    }

    if (/^\s{2,}[-•*]/.test(line) || /^\s{4,}/.test(line)) {
      lines.push({ type: "sub-bullet", content: trimmed.replace(/^[-•*]\s*/, "") });
      continue;
    }

    if (/^[-•*]\s/.test(trimmed)) {
      lines.push({ type: "bullet", content: trimmed.replace(/^[-•*]\s*/, "") });
      continue;
    }

    lines.push({ type: "text", content: trimmed });
  }

  return lines;
}

// ── Document renderers ────────────────────────────────────────────────────────

function renderCvDocument(lines: ParsedLine[], style: TemplateStyle): React.ReactElement {
  const elements: React.ReactElement[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.type === "blank") {
      elements.push(<div key={key++} style={{ height: "0.5em" }} />);
      continue;
    }

    if (line.type === "name") {
      elements.push(
        <div key={key++} style={{ textAlign: "center", marginBottom: "0.25rem" }}>
          <span style={{ fontSize: style.nameSize, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
            {line.content}
          </span>
        </div>,
      );
      continue;
    }

    if (line.type === "contact") {
      elements.push(
        <div key={key++} style={{ textAlign: "center", color: "#475569", fontSize: "0.8125rem", marginBottom: "0.15rem" }}>
          {line.content}
        </div>,
      );
      continue;
    }

    if (line.type === "section") {
      elements.push(
        <div key={key++} style={{ marginTop: "1rem", marginBottom: "0.35rem" }}>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: style.sectionColor,
              borderBottom: `2px solid ${style.sectionBorderColor}`,
              paddingBottom: "0.2rem",
            }}
          >
            {line.content}
          </div>
        </div>,
      );
      continue;
    }

    if (line.type === "bullet") {
      elements.push(
        <div key={key++} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.15rem", paddingLeft: "0.5rem" }}>
          <span style={{ color: style.accentColor, fontWeight: 700, flexShrink: 0 }}>·</span>
          <span style={{ fontSize: style.bodySize, lineHeight: style.lineHeight, color: "#1e293b" }}>{line.content}</span>
        </div>,
      );
      continue;
    }

    if (line.type === "sub-bullet") {
      elements.push(
        <div key={key++} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.1rem", paddingLeft: "1.5rem" }}>
          <span style={{ color: "#94a3b8", flexShrink: 0 }}>–</span>
          <span style={{ fontSize: `calc(${style.bodySize} - 0.0625rem)`, lineHeight: style.lineHeight, color: "#334155" }}>
            {line.content}
          </span>
        </div>,
      );
      continue;
    }

    elements.push(
      <div key={key++} style={{ fontSize: style.bodySize, lineHeight: style.lineHeight, color: "#1e293b", marginBottom: "0.15rem" }}>
        {line.content}
      </div>,
    );
  }

  return <>{elements}</>;
}

function renderSopDocument(lines: ParsedLine[], style: TemplateStyle): React.ReactElement {
  const elements: React.ReactElement[] = [];
  let key = 0;
  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ");
    elements.push(
      <p
        key={key++}
        style={{
          fontSize: style.bodySize,
          lineHeight: style.lineHeight,
          color: "#1e293b",
          marginBottom: "1rem",
          textAlign: "justify",
          textIndent: "1.5em",
        }}
      >
        {text}
      </p>,
    );
    paragraphBuffer = [];
  }

  for (const line of lines) {
    if (line.type === "blank") {
      flushParagraph();
      continue;
    }

    if (line.type === "name") {
      flushParagraph();
      elements.push(
        <div key={key++} style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: style.nameSize, fontWeight: 600, color: "#0f172a" }}>{line.content}</span>
        </div>,
      );
      continue;
    }

    if (line.type === "contact") {
      flushParagraph();
      elements.push(
        <div key={key++} style={{ textAlign: "center", color: "#475569", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
          {line.content}
        </div>,
      );
      continue;
    }

    if (line.type === "section") {
      flushParagraph();
      elements.push(
        <div key={key++} style={{ marginTop: "1.25rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: style.sectionColor,
              borderBottom: `1px solid ${style.sectionBorderColor}40`,
              paddingBottom: "0.25rem",
            }}
          >
            {line.content}
          </div>
        </div>,
      );
      continue;
    }

    if (line.type === "bullet") {
      flushParagraph();
      elements.push(
        <div key={key++} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.3rem", paddingLeft: "0.5rem" }}>
          <span style={{ color: style.accentColor, flexShrink: 0 }}>·</span>
          <span style={{ fontSize: style.bodySize, lineHeight: style.lineHeight, color: "#1e293b" }}>{line.content}</span>
        </div>,
      );
      continue;
    }

    // Regular text — buffer into paragraph
    if (line.content) {
      paragraphBuffer.push(line.content);
    }
  }

  flushParagraph();

  return <>{elements}</>;
}

// ── Public component ──────────────────────────────────────────────────────────

interface DocumentPreviewProps {
  content: string;
  template: string;
  mode: "cv" | "sop";
  className?: string;
}

export default function DocumentPreview({ content, template, mode, className }: DocumentPreviewProps) {
  const style = TEMPLATE_STYLES[template] ?? DEFAULT_STYLE;
  const lines = useMemo(() => parseDocument(content), [content]);

  return (
    <div
      className={className}
      style={{
        fontFamily: style.fontFamily,
        fontSize: style.bodySize,
        lineHeight: style.lineHeight,
        color: "#1e293b",
      }}
    >
      {/* A4-style paper shadow */}
      <div
        style={{
          background: "#ffffff",
          boxShadow: "0 4px 32px -4px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.06)",
          padding: "2rem 2.25rem",
          minHeight: "100%",
          borderRadius: "2px",
        }}
      >
        {mode === "cv" ? renderCvDocument(lines, style) : renderSopDocument(lines, style)}
      </div>
    </div>
  );
}
