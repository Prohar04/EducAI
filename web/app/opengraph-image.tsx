import { ImageResponse } from "next/og";

// A page-level `openGraph` block replaces the parent's entirely, so the images
// declared in the root layout were being dropped on the landing page. A
// file-based OG image is resolved per segment and cannot be lost that way — and
// unlike the previous SVG, a PNG is what Slack, WhatsApp, LinkedIn, Facebook
// and X will actually render.
export const alt = "EducAI — AI-powered study abroad platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #080D18 0%, #101C33 55%, #16294A 100%)",
          padding: "80px 88px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#4A90D9",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              color: "#7A8BA8",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            EducAI
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            fontSize: 86,
            lineHeight: 1.04,
            color: "#E8EEF8",
            letterSpacing: -2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span style={{ fontWeight: 300 }}>Study abroad,</span>
          <span style={{ fontWeight: 700 }}>without the chaos</span>
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 29,
            lineHeight: 1.45,
            color: "#8FA3BF",
            maxWidth: 880,
            display: "flex",
          }}
        >
          Program matching, scholarships, visas, documents and job search — in one place.
        </div>

        <div style={{ marginTop: 46, display: "flex", gap: 14 }}>
          {["30+ countries", "Real scholarship data", "Live job listings"].map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                fontSize: 21,
                color: "#B8CCE8",
                border: "1px solid rgba(74,144,217,0.35)",
                background: "rgba(74,144,217,0.10)",
                borderRadius: 999,
                padding: "10px 22px",
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
