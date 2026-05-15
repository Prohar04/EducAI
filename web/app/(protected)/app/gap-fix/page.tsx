"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import { useFirstVisit } from "@/lib/hooks/use-first-visit";
import {
  getGapFixItemsAction,
  analyzeGapFixItemsAction,
  uploadGapFixPDFAction,
  verifyGapFixEvidenceAction,
  skipGapFixItemAction,
  getUserProfile,
  type GapFixItemV2,
  type GapFixDataV2,
} from "@/lib/auth/action";

const GapFixAnimation = dynamic(
  () => import("@/components/animations/gap-fix-animation"),
  { ssr: false, loading: () => null },
);

// ─── Status / priority config ────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  not_started: {
    label: "Not Started",
    color: "#3D4F6B",
    bg: "rgba(61,79,107,0.12)",
    border: "rgba(61,79,107,0.30)",
    icon: "○",
  },
  in_progress: {
    label: "In Progress",
    color: "#4A90D9",
    bg: "rgba(74,144,217,0.12)",
    border: "rgba(74,144,217,0.30)",
    icon: "◉",
  },
  pending_verification: {
    label: "Pending Verification",
    color: "#C49A3C",
    bg: "rgba(196,154,60,0.12)",
    border: "rgba(196,154,60,0.30)",
    icon: "◎",
  },
  completed: {
    label: "Completed",
    color: "#3D9970",
    bg: "rgba(61,153,112,0.12)",
    border: "rgba(61,153,112,0.30)",
    icon: "✓",
  },
  skipped: {
    label: "Skipped",
    color: "#C0392B",
    bg: "rgba(192,57,43,0.12)",
    border: "rgba(192,57,43,0.30)",
    icon: "–",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: "High Priority", color: "#C0392B" },
  medium: { label: "Medium Priority", color: "#C49A3C" },
  low: { label: "Low Priority", color: "#3D4F6B" },
};

// ─── Score Ring ───────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? "#3D9970" : score >= 40 ? "#C49A3C" : "#C0392B";

  return (
    <svg width={128} height={128} viewBox="0 0 128 128">
      <circle
        cx={64}
        cy={64}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={10}
      />
      <circle
        cx={64}
        cy={64}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dasharray 800ms ease" }}
      />
      <text
        x={64}
        y={60}
        textAnchor="middle"
        fill="#E8EEF8"
        fontSize={26}
        fontWeight={700}
      >
        {score}
      </text>
      <text x={64} y={78} textAnchor="middle" fill="#7A8BA8" fontSize={11}>
        / 100
      </text>
    </svg>
  );
}

// ─── Evidence Panel ───────────────────────────────────────────────

function EvidencePanel({
  item,
  onVerified,
}: {
  item: GapFixItemV2;
  onVerified: (result: {
    verified: boolean;
    feedback: string;
    new_status: string;
    new_score: number;
    item: GapFixItemV2;
  }) => void;
}) {
  const [text, setText] = useState(item.evidenceText ?? "");
  const [url, setUrl] = useState(item.evidenceUrl ?? "");
  const [verifying, startVerify] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(item.pdfUrl ?? null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUploadPDF = (file: File) => {
    setLocalError(null);
    startUpload(async () => {
      const fd = new FormData();
      fd.append("pdf", file);
      const result = await uploadGapFixPDFAction(item.id, fd);
      if (result?.error) {
        setLocalError(result.error);
      } else if (result?.pdfUrl) {
        setUploadedPdf(result.pdfUrl);
      }
    });
  };

  const handleVerify = () => {
    if (!text.trim() && !url.trim() && !uploadedPdf) {
      setLocalError(
        "Please provide evidence first: write what you did, add a URL, or upload a PDF.",
      );
      return;
    }
    setLocalError(null);
    startVerify(async () => {
      const result = await verifyGapFixEvidenceAction(
        item.id,
        text.trim() || null,
        url.trim() || null,
      );
      if (!result || result.error) {
        setLocalError(result?.feedback ?? result?.error ?? "Verification failed");
        return;
      }
      onVerified(result);
    });
  };

  const alreadyVerified = item.aiVerified && item.status === "completed";

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        background: "rgba(255,255,255,0.02)",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "#7A8BA8",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 500,
        }}
      >
        Submit Evidence
      </p>

      {alreadyVerified ? (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(61,153,112,0.10)",
            border: "1px solid rgba(61,153,112,0.25)",
            borderRadius: 8,
            fontSize: 13,
            color: "#3D9970",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>✓</span>
          <span>
            AI Verified — {item.aiFeedback ?? "Evidence accepted."}
            {item.aiConfidence && (
              <span style={{ color: "#7A8BA8", marginLeft: 8 }}>
                ({Math.round(item.aiConfidence * 100)}% confidence)
              </span>
            )}
          </span>
        </div>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you have done to address this gap. Be specific — e.g. 'I completed the IELTS Academic exam on March 5th and scored 7.0'"
            rows={3}
            style={{
              width: "100%",
              resize: "vertical",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(74,144,217,0.20)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#E8EEF8",
              fontSize: 13,
              outline: "none",
              marginBottom: 10,
              lineHeight: 1.5,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Evidence URL — e.g. https://coursera.org/verify/your-certificate"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(74,144,217,0.20)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#E8EEF8",
              fontSize: 13,
              outline: "none",
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#7A8BA8",
                fontSize: 12,
                cursor: uploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {uploading ? "Uploading..." : "📎 Upload PDF"}
            </button>

            {uploadedPdf && (
              <span
                style={{
                  fontSize: 11,
                  color: "#3D9970",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ✓ PDF uploaded
              </span>
            )}

            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadPDF(file);
                e.target.value = "";
              }}
            />
          </div>

          {localError && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(192,57,43,0.10)",
                border: "1px solid rgba(192,57,43,0.25)",
                borderRadius: 8,
                fontSize: 12,
                color: "#C0392B",
                marginBottom: 10,
              }}
            >
              {localError}
            </div>
          )}

          {item.aiFeedback && !alreadyVerified && (
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(196,154,60,0.08)",
                border: "1px solid rgba(196,154,60,0.20)",
                borderRadius: 8,
                fontSize: 12,
                color: "#C49A3C",
                marginBottom: 10,
              }}
            >
              Previous feedback: {item.aiFeedback}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying}
            style={{
              padding: "10px 22px",
              background: verifying
                ? "rgba(74,144,217,0.40)"
                : "rgba(74,144,217,0.88)",
              color: "#080D18",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: verifying ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              justifyContent: "center",
            }}
          >
            {verifying ? "AI is verifying..." : "✓ Verify with AI"}
          </button>

          <p
            style={{
              fontSize: 11,
              color: "#3D4F6B",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Score only updates after AI verification passes
          </p>
        </>
      )}
    </div>
  );
}

// ─── Gap Card ─────────────────────────────────────────────────────

function GapCard({
  item,
  onUpdate,
}: {
  item: GapFixItemV2;
  onUpdate: (updated: { item: GapFixItemV2; new_score: number }) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [skipping, startSkip] = useTransition();
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.not_started;
  const priority = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.medium;

  const handleVerified = (result: {
    verified: boolean;
    feedback: string;
    new_status: string;
    new_score: number;
    item: GapFixItemV2;
  }) => {
    onUpdate({ item: result.item, new_score: result.new_score });
    if (result.verified) setExpanded(false);
  };

  const handleSkip = () => {
    startSkip(async () => {
      const result = await skipGapFixItemAction(item.id);
      if (result) {
        onUpdate({
          item: { ...item, status: "skipped", aiVerified: false },
          new_score: result.new_score,
        });
      }
    });
  };

  return (
    <div
      style={{
        background: "rgba(13,22,37,0.65)",
        border: `1px solid ${item.aiVerified && item.status === "completed" ? "rgba(61,153,112,0.35)" : "rgba(74,144,217,0.18)"}`,
        borderRadius: 14,
        padding: 20,
        transition: "border-color 300ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: status.color,
                background: status.bg,
                border: `1px solid ${status.border}`,
                padding: "2px 10px",
                borderRadius: 999,
              }}
            >
              {status.icon} {status.label}
            </span>
            <span style={{ fontSize: 10, color: priority.color, fontWeight: 500 }}>
              {priority.label}
            </span>
            {item.aiVerified && (
              <span
                style={{
                  fontSize: 10,
                  color: "#3D9970",
                  background: "rgba(61,153,112,0.10)",
                  border: "1px solid rgba(61,153,112,0.25)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontWeight: 600,
                }}
              >
                ✓ AI Verified
              </span>
            )}
          </div>

          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#E8EEF8",
              margin: 0,
              marginBottom: 6,
            }}
          >
            {item.title}
          </h3>

          <p
            style={{
              fontSize: 13,
              color: "#7A8BA8",
              margin: 0,
              lineHeight: 1.5,
              display: expanded ? "block" : "-webkit-box",
              WebkitLineClamp: expanded ? undefined : 2,
              WebkitBoxOrient: "vertical",
              overflow: expanded ? "visible" : "hidden",
            }}
          >
            {item.description}
          </p>
        </div>

        <span
          style={{
            fontSize: 14,
            color: "#3D4F6B",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          ▼
        </span>
      </div>

      {expanded && (
        <>
          {item.resourceLinks?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p
                style={{
                  fontSize: 11,
                  color: "#3D4F6B",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
                }}
              >
                Resources
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {item.resourceLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 12,
                      color: "#4A90D9",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      background: "rgba(74,144,217,0.06)",
                      borderRadius: 6,
                      border: "1px solid rgba(74,144,217,0.12)",
                    }}
                  >
                    <span>↗</span>
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {item.status !== "skipped" && (
            <EvidencePanel item={item} onVerified={handleVerified} />
          )}

          {(item.status === "not_started" || item.status === "in_progress") && (
            <button
              onClick={handleSkip}
              disabled={skipping}
              style={{
                marginTop: 10,
                padding: "6px 14px",
                background: "transparent",
                border: "1px solid rgba(192,57,43,0.25)",
                borderRadius: 6,
                color: "#C0392B",
                fontSize: 11,
                cursor: skipping ? "not-allowed" : "pointer",
              }}
            >
              {skipping ? "Skipping..." : "Skip this gap"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function GapFixPage() {
  const isFirst = useFirstVisit("gap-fix");
  const [data, setData] = useState<GapFixDataV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, startAnalyze] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(() => {
    getGapFixItemsAction().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAnalyze = () => {
    setError(null);
    startAnalyze(async () => {
      const profileData = await getUserProfile();
      const profile = (profileData as unknown as Record<string, unknown>) ?? {};
      const result = await analyzeGapFixItemsAction(
        profile,
        (profile.targetCountries as string[]) ?? [],
        (profile.fieldOfStudy as string) ?? (profile.intendedMajor as string) ?? "General",
      );
      if (!result) {
        setError("Analysis failed. Please try again.");
        return;
      }
      setData(result);
    });
  };

  const handleItemUpdate = ({
    item,
    new_score,
  }: {
    item: GapFixItemV2;
    new_score: number;
  }) => {
    setData((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((i) => (i.id === item.id ? item : i));
      const completedItems = items.filter(
        (i) => i.aiVerified && i.status === "completed",
      ).length;
      return { ...prev, items, score: new_score, completedItems };
    });
  };

  const filteredItems =
    data?.items.filter((item) => {
      if (filter === "all") return true;
      if (filter === "pending")
        return item.status !== "completed" && item.status !== "skipped";
      if (filter === "completed") return item.status === "completed";
      return true;
    }) ?? [];

  const FILTERS = [
    { key: "all", label: "All", count: data?.items.length ?? 0 },
    {
      key: "pending",
      label: "Pending",
      count:
        data?.items.filter(
          (i) => i.status !== "completed" && i.status !== "skipped",
        ).length ?? 0,
    },
    { key: "completed", label: "Completed", count: data?.completedItems ?? 0 },
  ];

  return (
    <div
      className={`${isFirst ? "page-enter" : ""} mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8`}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          padding: "28px 0 20px",
          marginBottom: 24,
          overflow: "hidden",
          minHeight: 140,
        }}
      >
        <div
          aria-hidden="true"
          className="hidden xl:block"
          style={{
            position: "absolute",
            right: -40,
            top: 0,
            bottom: 0,
            width: "42%",
            opacity: 0.8,
            pointerEvents: "none",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 35%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 35%)",
          }}
        >
          <GapFixAnimation />
        </div>

        <div className="page-header-content" style={{ position: "relative", zIndex: 1, maxWidth: "min(58%, 760px)" }}>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "#E8EEF8",
              letterSpacing: "-0.025em",
              margin: 0,
              marginBottom: 10,
            }}
          >
            Gap <span className="gradient-text">Fix</span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#7A8BA8",
              fontWeight: 300,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            AI analyzes your profile gaps and verifies your evidence before
            updating your score.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="skeleton"
              style={{ width: 128, height: 128, borderRadius: "50%" }}
            />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 100,
                borderRadius: 14,
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            color: "#C0392B",
            fontSize: 14,
          }}
        >
          {error}
          <button
            onClick={() => void load()}
            style={{
              display: "block",
              margin: "16px auto 0",
              padding: "8px 20px",
              background: "rgba(74,144,217,0.15)",
              border: "1px solid rgba(74,144,217,0.25)",
              borderRadius: 8,
              color: "#4A90D9",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      ) : !data || data.items.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#E8EEF8",
              marginBottom: 12,
            }}
          >
            Analyze Your Profile Gaps
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#7A8BA8",
              maxWidth: 400,
              margin: "0 auto 28px",
              lineHeight: 1.6,
            }}
          >
            AI will analyze your profile and identify specific weaknesses that
            could hurt your university applications.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{
              padding: "13px 32px",
              background: analyzing
                ? "rgba(74,144,217,0.40)"
                : "rgba(74,144,217,0.88)",
              color: "#080D18",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: analyzing ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {analyzing ? "Analyzing your profile..." : "Run AI Gap Analysis"}
          </button>
        </div>
      ) : (
        <>
          {/* Score + stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 32,
              alignItems: "center",
              padding: 24,
              background: "rgba(13,22,37,0.65)",
              border: "1px solid rgba(74,144,217,0.18)",
              borderRadius: 16,
              marginBottom: 28,
            }}
          >
            <ScoreRing score={data.score} />
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#E8EEF8",
                  marginBottom: 6,
                }}
              >
                Profile Gap Score
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#7A8BA8",
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                {data.completedItems} of {data.totalItems} gaps verified and
                completed. Score only increases when AI verifies your evidence.
              </p>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { label: "Total Gaps", value: data.totalItems, color: "#4A90D9" },
                  { label: "Completed", value: data.completedItems, color: "#3D9970" },
                  {
                    label: "Remaining",
                    value: data.totalItems - data.completedItems,
                    color: "#C49A3C",
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      style={{ fontSize: 24, fontWeight: 700, color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "#7A8BA8" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div
            style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: "7px 16px",
                  background:
                    filter === f.key
                      ? "rgba(74,144,217,0.15)"
                      : "rgba(255,255,255,0.04)",
                  border:
                    filter === f.key
                      ? "1px solid rgba(74,144,217,0.35)"
                      : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 999,
                  color: filter === f.key ? "#E8EEF8" : "#7A8BA8",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {f.label} ({f.count})
              </button>
            ))}

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                marginLeft: "auto",
                padding: "7px 16px",
                background: "transparent",
                border: "1px solid rgba(74,144,217,0.25)",
                borderRadius: 999,
                color: "#4A90D9",
                fontSize: 12,
                fontWeight: 500,
                cursor: analyzing ? "not-allowed" : "pointer",
                outline: "none",
              }}
            >
              {analyzing ? "Analyzing..." : "↺ Re-analyze"}
            </button>
          </div>

          {/* Gap items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  color: "#7A8BA8",
                  fontSize: 14,
                }}
              >
                No gaps in this category.
              </div>
            ) : (
              filteredItems.map((item) => (
                <GapCard key={item.id} item={item} onUpdate={handleItemUpdate} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
