"use client"
import type { FeedItem } from "@/lib/data/fetchEducationPulse"

interface Props {
  items: FeedItem[]
}

const TOPIC_COLORS: Record<string, string> = {
  Admissions:    "rgba(74,144,217,0.15)",
  Research:      "rgba(255,255,255,0.05)",
  Visa:          "rgba(196,154,60,0.12)",
  Scholarship:   "rgba(61,153,112,0.12)",
  Ranking:       "rgba(74,144,217,0.10)",
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

export default function EducationNews({ items }: Props) {
  const displayItems = items.filter((i) => !i.isDigest).slice(0, 6)

  if (displayItems.length === 0) {
    return (
      <div style={{
        background: "rgba(13,22,37,0.65)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 32,
        textAlign: "center",
        color: "#3D4F6B",
        fontSize: 14,
      }}>
        News unavailable at this time.
      </div>
    )
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 12,
    }}>
      {displayItems.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            background: "rgba(13,22,37,0.65)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: 18,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            textDecoration: "none",
            transition: "border-color 200ms, transform 200ms",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.borderColor = "rgba(74,144,217,0.25)"
            el.style.transform = "translateY(-2px)"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.borderColor = "rgba(255,255,255,0.06)"
            el.style.transform = "translateY(0)"
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7A8BA8",
              background: TOPIC_COLORS[item.topic] ?? "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 100,
              padding: "3px 8px",
              whiteSpace: "nowrap",
            }}>
              {item.topic}
            </span>
            <span style={{ fontSize: 11, color: "#2A3A52", whiteSpace: "nowrap", flexShrink: 0 }}>
              {item.sourceName}
            </span>
          </div>

          {/* Title */}
          <p style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#E8EEF8",
            lineHeight: 1.4,
            marginBottom: 8,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {item.title}
          </p>

          {/* Snippet */}
          <p style={{
            fontSize: 12,
            fontWeight: 300,
            color: "#7A8BA8",
            lineHeight: 1.6,
            marginBottom: 12,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {item.snippet}
          </p>

          {/* Bottom */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#2A3A52" }}>
              {formatDate(item.publishedAt)}
            </span>
            <span style={{ fontSize: 12, color: "#4A90D9", fontWeight: 500 }}>
              Read →
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}
