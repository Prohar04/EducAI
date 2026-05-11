"use client"

export type SOPTemplate =
  | "standard_academic"
  | "research_focused"
  | "professional_mba"

export type CVTemplate =
  | "us_standard"
  | "european_europass"
  | "google_faang"
  | "microsoft_enterprise"
  | "academic_research"
  | "industry_general"

export const SOP_TEMPLATES: Array<{
  id: SOPTemplate
  label: string
  description: string
  wordCount: string
  tone: string
  universities: string
}> = [
  {
    id: "standard_academic",
    label: "Standard Academic",
    description: "4 paragraphs: background, motivation, fit, future plans",
    wordCount: "800–1000 words",
    tone: "Formal academic",
    universities: "Most universities worldwide",
  },
  {
    id: "research_focused",
    label: "Research Focused",
    description: "Emphasizes research experience, lab work, publications",
    wordCount: "1000–1200 words",
    tone: "Technical academic",
    universities: "PhD programs, research universities",
  },
  {
    id: "professional_mba",
    label: "Professional MBA",
    description: "Leadership, impact, career goals and ROI",
    wordCount: "600–800 words",
    tone: "Professional confident",
    universities: "Business schools, MBA programs",
  },
]

export const CV_TEMPLATES: Array<{
  id: CVTemplate
  label: string
  description: string
  length: string
  order: string
  style: string
}> = [
  {
    id: "us_standard",
    label: "US Standard (ATS)",
    description: "ATS-optimized, experience first, one page",
    length: "1 page strict",
    order: "Experience → Education → Skills",
    style: "Clean sans-serif, bullet points",
  },
  {
    id: "european_europass",
    label: "European (Europass)",
    description: "EU standard format, education first, detailed",
    length: "2 pages",
    order: "Personal Info → Education → Experience → Skills",
    style: "Structured, formal",
  },
  {
    id: "google_faang",
    label: "Google / FAANG",
    description: "Quantified achievements, STAR format bullets",
    length: "1–2 pages",
    order: "Experience → Projects → Education → Skills",
    style: "Impact numbers, action verbs",
  },
  {
    id: "microsoft_enterprise",
    label: "Microsoft Enterprise",
    description: "Collaborative achievements, leadership, enterprise scale",
    length: "1–2 pages",
    order: "Summary → Experience → Skills → Education",
    style: "Professional, growth-focused",
  },
  {
    id: "academic_research",
    label: "Academic / Research",
    description: "Publications, research, teaching, conferences",
    length: "3+ pages",
    order: "Education → Research → Publications → Teaching",
    style: "Academic comprehensive",
  },
  {
    id: "industry_general",
    label: "Industry General",
    description: "Balanced for all industries, versatile",
    length: "1–2 pages",
    order: "Summary → Experience → Education → Skills",
    style: "Professional neutral",
  },
]

interface Props {
  mode: "sop" | "cv"
  selected: string
  onSelect: (id: string) => void
}

export default function DocumentTemplateSelector({
  mode, selected, onSelect,
}: Props) {
  const templates = mode === "sop" ? SOP_TEMPLATES : CV_TEMPLATES

  return (
    <div>
      <p style={{
        fontSize: 12, color: "#7A8BA8", marginBottom: 12,
        textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500,
      }}>
        Choose Template
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        gap: 10,
      }}>
        {templates.map((t) => {
          const isSelected = selected === t.id
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              style={{
                padding: "12px 14px",
                background: isSelected
                  ? "rgba(74,144,217,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: isSelected
                  ? "1px solid rgba(74,144,217,0.45)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                textAlign: "left",
                cursor: "pointer",
                outline: "none",
                transition: "all 180ms ease",
              }}
            >
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: isSelected ? "#4A90D9" : "#E8EEF8",
                marginBottom: 4,
              }}>
                {t.label}
              </div>
              <div style={{
                fontSize: 11, color: "#7A8BA8", lineHeight: 1.4,
              }}>
                {t.description}
              </div>
              {"wordCount" in t && (
                <div style={{
                  fontSize: 10, color: "#3D4F6B", marginTop: 6,
                  fontWeight: 500,
                }}>
                  {(t as typeof SOP_TEMPLATES[0]).wordCount}
                </div>
              )}
              {"length" in t && (
                <div style={{
                  fontSize: 10, color: "#3D4F6B", marginTop: 6,
                  fontWeight: 500,
                }}>
                  {(t as typeof CV_TEMPLATES[0]).length}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
