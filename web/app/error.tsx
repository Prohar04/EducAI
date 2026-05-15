"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
    // When Sentry is configured (npx @sentry/wizard -i nextjs), it auto-instruments this
    // and captures uncaught errors without any manual call needed here.
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#080D18",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            background: "linear-gradient(120deg, #4A90D9 0%, #B8CCE8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          500
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#E8EEF8",
            marginBottom: 10,
          }}
        >
          Something went wrong
        </h1>
        <p style={{ color: "#7A8BA8", fontSize: 15, marginBottom: 28 }}>
          An unexpected error occurred. Our team has been notified. Please try
          again or return to the dashboard.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 22px",
              background: "#4A90D9",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/app"
            style={{
              padding: "10px 22px",
              background: "rgba(255,255,255,0.06)",
              color: "#E8EEF8",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Go to Dashboard
          </Link>
        </div>
        {error.digest && (
          <p style={{ marginTop: 20, fontSize: 11, color: "#3D4F6B" }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
