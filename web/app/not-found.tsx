import Link from "next/link"

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            background: "linear-gradient(120deg, #4A90D9 0%, #B8CCE8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#E8EEF8",
            marginBottom: 12,
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#7A8BA8",
            fontWeight: 300,
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          This page doesn&apos;t exist or has moved. Let&apos;s get you back on track.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              padding: "11px 22px",
              background: "rgba(74,144,217,0.88)",
              color: "#080D18",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Go home
          </Link>
          <Link
            href="/app"
            style={{
              padding: "11px 22px",
              background: "rgba(255,255,255,0.04)",
              color: "#E8EEF8",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
